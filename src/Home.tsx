import { useEffect, useMemo, useState, useCallback } from "react";
import * as anchor from "@project-serum/anchor";

import { Container, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Parallax } from "react-parallax";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
  getCollectionPDA,
  SetupState,
  createAccountsForMint,
} from "./candy-machine";
import { AlertState, toDate, formatNumber, getAtaForMint } from "./utilsweb";
import { MintCountdown } from "./MintCountdown";
import { MintButton } from "./MintButton";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { sendTransaction } from "./connection";
import Faq from "./components/Faq";
import styled from "styled-components";

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [isPresale, setIsPresale] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>();
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );
        let active =
          cndy?.state.goLiveDate?.toNumber() < new Date().getTime() / 1000;
        let presale = false;
        // whitelist mint?
        if (cndy?.state.whitelistMintSettings) {
          // is it a presale mint?
          if (
            cndy.state.whitelistMintSettings.presale &&
            (!cndy.state.goLiveDate ||
              cndy.state.goLiveDate.toNumber() > new Date().getTime() / 1000)
          ) {
            presale = true;
          }
          // is there a discount?
          if (cndy.state.whitelistMintSettings.discountPrice) {
            setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice);
          } else {
            setDiscountPrice(undefined);
            // when presale=false and discountPrice=null, mint is restricted
            // to whitelist users only
            if (!cndy.state.whitelistMintSettings.presale) {
              cndy.state.isWhitelistOnly = true;
            }
          }
          // retrieves the whitelist token
          const mint = new anchor.web3.PublicKey(
            cndy.state.whitelistMintSettings.mint
          );
          const token = (await getAtaForMint(mint, anchorWallet.publicKey))[0];

          try {
            const balance = await props.connection.getTokenAccountBalance(
              token
            );
            let valid = parseInt(balance.value.amount) > 0;
            // only whitelist the user if the balance > 0
            setIsWhitelistUser(valid);
            active = (presale && valid) || active;
          } catch (e) {
            setIsWhitelistUser(false);
            // no whitelist user, no mint
            if (cndy.state.isWhitelistOnly) {
              active = false;
            }
            console.log("There was a problem fetching whitelist token balance");
            console.log(e);
          }
        }
        // datetime to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber() <
            new Date().getTime() / 1000
          ) {
            active = false;
          }
        }
        // amount to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        if (cndy.state.isSoldOut) {
          active = false;
        }

        const [collectionPDA] = await getCollectionPDA(props.candyMachineId);
        const collectionPDAAccount =
          await cndy.program.provider.connection.getAccountInfo(collectionPDA);

        setIsActive((cndy.state.isActive = active));
        setIsPresale((cndy.state.isPresale = presale));
        setCandyMachine(cndy);

        const txnEstimate =
          892 +
          (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
          (cndy.state.tokenMint ? 177 : 0) +
          (cndy.state.whitelistMintSettings ? 33 : 0) +
          (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 145 : 0) +
          (cndy.state.gatekeeper ? 33 : 0) +
          (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

        setNeedTxnSplit(txnEstimate > 1230);
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === `Account does not exist ${props.candyMachineId}`) {
            setAlertState({
              open: true,
              message: `Couldn't fetch candy machine state from candy machine with address: ${props.candyMachineId}, using rpc: ${props.rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value in wrong in your .env file, or you are using the wrong RPC!`,
              severity: "error",
              noHide: true,
            });
          } else if (e.message.startsWith("failed to get info about account")) {
            setAlertState({
              open: true,
              message: `Couldn't fetch candy machine state with rpc: ${props.rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
              severity: "error",
              noHide: true,
            });
          }
        } else {
          setAlertState({
            open: true,
            message: `${e}`,
            severity: "error",
            noHide: true,
          });
        }
        console.log(e);
      }
    } else {
      setAlertState({
        open: true,
        message: `Your REACT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`,
        severity: "error",
        noHide: true,
      });
    }
  }, [anchorWallet, props.candyMachineId, props.connection, props.rpcHost]);

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    try {
      setIsUserMinting(true);
      document.getElementById("#identity")?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setAlertState({
            open: true,
            message: "Please sign account setup transaction",
            severity: "info",
          });
          setupMint = await createAccountsForMint(
            candyMachine,
            wallet.publicKey
          );
          let status: any = { err: true };
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              props.txTimeout,
              props.connection,
              true
            );
          }
          if (status && !status.err) {
            setSetupTxn(setupMint);
            setAlertState({
              open: true,
              message:
                "Setup transaction succeeded! Please sign minting transaction",
              severity: "info",
            });
          } else {
            setAlertState({
              open: true,
              message: "Mint failed! Please try again!",
              severity: "error",
            });
            setIsUserMinting(false);
            return;
          }
        } else {
          setAlertState({
            open: true,
            message: "Please sign minting transaction",
            severity: "info",
          });
        }

        let mintOne = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          beforeTransactions,
          afterTransactions,
          setupMint ?? setupTxn
        );
        const mintTxId = mintOne[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true
          );
        }

        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          setSetupTxn(undefined);
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction timeout! Please try again.";
        } else if (error.message.indexOf("0x137")) {
          console.log(error);
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
      // updates the candy machine state to reflect the latest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setIsUserMinting(false);
    }
  };

  const toggleMintButton = () => {
    let active = !isActive || isPresale;

    if (active) {
      if (candyMachine!.state.isWhitelistOnly && !isWhitelistUser) {
        active = false;
      }
      if (endDate && Date.now() >= endDate.getTime()) {
        active = false;
      }
    }

    if (
      isPresale &&
      candyMachine!.state.goLiveDate &&
      candyMachine!.state.goLiveDate.toNumber() <= new Date().getTime() / 1000
    ) {
      setIsPresale((candyMachine!.state.isPresale = false));
    }

    setIsActive((candyMachine!.state.isActive = active));
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  return (
    <>
      <section id="home">
        <Container>
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 mx-auto">
              <div className="row row-centered">
                {/* <div className="col-sm mx-auto">
                    <Image
                      loading="lazy"
                      width="524"
                      height="262"
                      src="/logo_header.png"
                      alt="logo"
                    />
                  </div> */}
                <h1>
                  Ducks born on the Solana blockchain. Limited edition NFT
                  collection.
                </h1>
              </div>
              <div className="col-md-12 col-sm-12 col-xs-12 mx-auto">
                <Slider
                  dots={true}
                  infinite={true}
                  // nextArrow={<CustomArrow type={'next'}/>}
                  // prevArrow={<CustomArrow type={'prev'} />}
                  autoplay={true}
                  speed={500}
                  slidesToShow={3}
                  slidesToScroll={1}
                  responsive={[
                    {
                      breakpoint: 1200,
                      settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                      },
                    },
                    {
                      breakpoint: 1024,
                      settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                      },
                    },
                    {
                      breakpoint: 768,
                      settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                      },
                    },
                  ]}
                >
                  <div className="text-center">
                  <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/0.png"
                      alt="dev"
                    />
                  </div>
                  </div>
                  <div className="text-center">
                  <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/1.png"
                      alt="dev"
                    />
                  </div>
                  </div>
                  <div className="text-center">
                  <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/2.png"
                      alt="dev"
                    />
                  </div>
                  </div>
                  <div className="text-center">
                  <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/3.png"
                      alt="dev"
                    />
                  </div>
                  </div>
                  <div className="text-center">
                  <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/4.png"
                      alt="dev"
                    />
                  </div>
                  </div>
                  <div className="text-center">
                    <div className="glow-on-hover-img">
                    <img
                      loading="lazy"
                      width="350"
                      height="442"
                      src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/5.png"
                      alt="dev"
                    />
                    </div>
                  </div>
                </Slider>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="mint">
        <Container>
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 mx-auto">
              <div className="row">
                <div className="col-sm mx-auto">
                  <h3 className="animated-gradient-text2">OUR STORY</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nulla ac auctor nunc, et maximus magna. Pellentesque sapien
                    magna, venenatis sit amet commodo eu, pretium eget justo.
                    Integer at urna auctor lorem porttitor hendrerit ut a diam.
                    Ut vel nulla ut turpis sollicitudin pretium eget sit amet
                    metus. Aenean id efficitur justo, ac semper lorem.
                  </p>
                  <p>
                    Suspendisse potenti. Vivamus tortor purus, facilisis eget
                    condimentum facilisis, aliquet vel libero. Cras eros tortor,
                    rutrum in volutpat ac, gravida quis erat. In arcu ante,
                    sodales id finibus id, ultricies eget tortor.
                  </p>
                </div>
                <div className="col-sm mx-auto">
                  <div className="row row-centered">
                    <div className="col-sm mx-auto">
                      <div className="glow-on-hover-img">
                        <img
                          className="mx-auto mint__image"
                          loading="lazy"
                          id="random"
                          src="https://s3.eu-central-1.wasabisys.com/somefiles/wormsol/5.png"
                          alt="random nft"
                          width="350"
                          height="442"
                        />
                      </div>
                      <input
                        autoFocus
                        placeholder="Mint amount"
                        type="number"
                        // disabled={isMinting}
                        className="mint-amount-input"
                        // value={mintCount}
                        // onChange={(e) => setMintCount((e.target as any).value)}
                      />
                      <Container>
                        <Container
                          maxWidth="xs"
                          style={{ position: "relative" }}
                        >
                          {candyMachine && (
                            <Grid
                              container
                              direction="row"
                              justifyContent="center"
                              wrap="nowrap"
                            >
                              <Grid item xs={3}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  Remaining
                                </Typography>
                                <Typography
                                  variant="h6"
                                  color="textPrimary"
                                  style={{
                                    fontWeight: "bold",
                                  }}
                                >
                                  {`${itemsRemaining}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {isWhitelistUser && discountPrice
                                    ? "Discount Price"
                                    : "Price"}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  color="textPrimary"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {isWhitelistUser && discountPrice
                                    ? `◎ ${formatNumber.asNumber(
                                        discountPrice
                                      )}`
                                    : `◎ ${formatNumber.asNumber(
                                        candyMachine.state.price
                                      )}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={5}>
                                {isActive &&
                                endDate &&
                                Date.now() < endDate.getTime() ? (
                                  <>
                                    <MintCountdown
                                      key="endSettings"
                                      date={getCountdownDate(candyMachine)}
                                      style={{ justifyContent: "flex-end" }}
                                      status="COMPLETED"
                                      onComplete={toggleMintButton}
                                    />
                                    <Typography
                                      variant="caption"
                                      align="center"
                                      display="block"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      TO END OF MINT
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <MintCountdown
                                      key="goLive"
                                      date={getCountdownDate(candyMachine)}
                                      style={{ justifyContent: "flex-end" }}
                                      status={
                                        candyMachine?.state?.isSoldOut ||
                                        (endDate &&
                                          Date.now() > endDate.getTime())
                                          ? "COMPLETED"
                                          : isPresale
                                          ? "PRESALE"
                                          : "LIVE"
                                      }
                                      onComplete={toggleMintButton}
                                    />
                                    {isPresale &&
                                      candyMachine.state.goLiveDate &&
                                      candyMachine.state.goLiveDate.toNumber() >
                                        new Date().getTime() / 1000 && (
                                        <Typography
                                          variant="caption"
                                          align="center"
                                          display="block"
                                          style={{ fontWeight: "bold" }}
                                        >
                                          UNTIL PUBLIC MINT
                                        </Typography>
                                      )}
                                  </>
                                )}
                              </Grid>
                            </Grid>
                          )}
                          <MintContainer>
                            {candyMachine?.state.isActive &&
                            candyMachine?.state.gatekeeper &&
                            wallet.publicKey &&
                            wallet.signTransaction ? (
                              <GatewayProvider
                                wallet={{
                                  publicKey:
                                    wallet.publicKey ||
                                    new PublicKey(CANDY_MACHINE_PROGRAM),
                                  //@ts-ignore
                                  signTransaction: wallet.signTransaction,
                                }}
                                gatekeeperNetwork={
                                  candyMachine?.state?.gatekeeper
                                    ?.gatekeeperNetwork
                                }
                                clusterUrl={rpcUrl}
                                handleTransaction={async (
                                  transaction: Transaction
                                ) => {
                                  setIsUserMinting(true);
                                  const userMustSign =
                                    transaction.signatures.find((sig) =>
                                      sig.publicKey.equals(wallet.publicKey!)
                                    );
                                  if (userMustSign) {
                                    setAlertState({
                                      open: true,
                                      message:
                                        "Please sign one-time Civic Pass issuance",
                                      severity: "info",
                                    });
                                    try {
                                      transaction =
                                        await wallet.signTransaction!(
                                          transaction
                                        );
                                    } catch (e) {
                                      setAlertState({
                                        open: true,
                                        message: "User cancelled signing",
                                        severity: "error",
                                      });
                                      // setTimeout(() => window.location.reload(), 2000);
                                      setIsUserMinting(false);
                                      throw e;
                                    }
                                  } else {
                                    setAlertState({
                                      open: true,
                                      message: "Refreshing Civic Pass",
                                      severity: "info",
                                    });
                                  }
                                  try {
                                    await sendTransaction(
                                      props.connection,
                                      wallet,
                                      transaction,
                                      [],
                                      true,
                                      "confirmed"
                                    );
                                    setAlertState({
                                      open: true,
                                      message: "Please sign minting",
                                      severity: "info",
                                    });
                                  } catch (e) {
                                    setAlertState({
                                      open: true,
                                      message:
                                        "Solana dropped the transaction, please try again",
                                      severity: "warning",
                                    });
                                    console.error(e);
                                    // setTimeout(() => window.location.reload(), 2000);
                                    setIsUserMinting(false);
                                    throw e;
                                  }
                                  await onMint();
                                }}
                                broadcastTransaction={false}
                                options={{ autoShowModal: false }}
                              >
                                <MintButton
                                  candyMachine={candyMachine}
                                  isMinting={isUserMinting}
                                  setIsMinting={(val) => setIsUserMinting(val)}
                                  onMint={onMint}
                                  isActive={
                                    isActive || (isPresale && isWhitelistUser)
                                  }
                                />
                              </GatewayProvider>
                            ) : (
                              <MintButton
                                candyMachine={candyMachine}
                                isMinting={isUserMinting}
                                setIsMinting={(val) => setIsUserMinting(val)}
                                onMint={onMint}
                                isActive={
                                  isActive || (isPresale && isWhitelistUser)
                                }
                              />
                            )}
                          </MintContainer>
                        </Container>
                        <Snackbar
                          open={alertState.open}
                          autoHideDuration={alertState.noHide ? null : 6000}
                          onClose={() =>
                            setAlertState({ ...alertState, open: false })
                          }
                        >
                          <Alert
                            onClose={() =>
                              setAlertState({ ...alertState, open: false })
                            }
                            severity={alertState.severity}
                          >
                            {alertState.message}
                          </Alert>
                        </Snackbar>
                      </Container>
                    </div>
                  </div>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <div className="row separator">
        <div className="col-md-12 col-sm-12 col-xs-12 mx-auto">
          <div className="row row-centered">
            <div className="col-sm mx-auto"></div>
          </div>
        </div>
      </div>
      <Parallax blur={0} bgImageAlt="the cat" strength={400}>
        <section id="faq">
          <Container>
            <Faq />
          </Container>
        </section>
      </Parallax>
    </>
  );
};

const getCountdownDate = (
  candyMachine: CandyMachineAccount
): Date | undefined => {
  if (
    candyMachine.state.isActive &&
    candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }

  return toDate(
    candyMachine.state.goLiveDate
      ? candyMachine.state.goLiveDate
      : candyMachine.state.isPresale
      ? new anchor.BN(new Date().getTime() / 1000)
      : undefined
  );
};

export default Home;
