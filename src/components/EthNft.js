import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
// useEffect と useState 関数を React.js からインポートしています。
import React, { useEffect, useState } from "react";
import './styles/ethnft.css';
import twitterLogo from './assets/twitter-logo.svg';
import raribleLogo from './assets/rarible-logo-400x400.png';
// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = '10_to_Sen';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
//const OPENSEA_LINK = '';
const MAX_SUPPLY = 50;
const CONTRACT_ADDRESS = "0xeF5cc867557e28c2AB2CeFa98362547138d22DE3";
const RARIBLE_LINK = "https://rinkeby.rarible.com/collection/0x8cB688A30D5Fd6f2e5025d8915eD95e770832933/owned"

const EthNft = () => {
  // Loading画面のための状態変数を定義
  const [isLoading, setLoading] = useState(false);
  /*
  * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  */
  const [currentAccount, setCurrentAccount] = useState("");
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);
  /*
  * ユーザーが認証可能なウォレットアドレスを持っているか確認します。
  */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    //ここで接続しているネットワークの判定
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);
    // 0x4 は　Rinkeby の ID です。
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
    
    /* ユーザーが認証可能なウォレットアドレスを持っている場合は、
     * ユーザーに対してウォレットへのアクセス許可を求める。
     * 許可されれば、ユーザーの最初のウォレットアドレスを
     * accounts に格納する。
     */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // **** イベントリスナーをここで設定 ****
	    // この時点で、ユーザーはウォレット接続が済んでいます。
	    setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  }

  /*
  * connectWallet メソッドを実装します。
  */
  const connectWallet = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * ウォレットアドレスに対してアクセスをリクエストしています。
      */
     // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
     // eth_requestAccounts メソッドを使用することで、MetaMask からユーザーにウォレットへのアクセスを許可するよう呼びかけることができる
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      /*
      * ウォレットアドレスを currentAccount に紐付けます。
      */
      setCurrentAccount(accounts[0]);
      // **** イベントリスナーをここで設定 ****
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

// setupEventListener 関数を定義します。
// MyEpicNFT.sol の中で event が　emit された時に、
// 情報を受け取ります。
const setupEventListener = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      // NFT が発行されます。
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
      connectedContract.on("NewEpicNFTMinted", (from, tokenId, ) => {
        console.log(from, tokenId.toNumber());
        alert(
          `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        );
      });
      
      console.log("Setup event listener!");
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
}

  // コントラクトとWEBサイトを連動
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        // provider を介して、ユーザーはブロックチェーン上に存在するイーサリアムノードに接続することができます
        // MetaMask が提供するイーサリアムノードを使用して、デプロイされたコントラクトからデータを送受信する
        const provider = new ethers.providers.Web3Provider(ethereum);

        // signer は、ユーザーのウォレットアドレスを抽象化したもの
        // provider を作成し、provider.getSigner() を呼び出すだけで、ユーザーはウォレットアドレスを使用してトランザクションに署名し、そのデータをイーサリアムネットワークに送信できる
        // provider.getSigner() は新しい signer インスタンスを返すので、それを使って署名付きトランザクションを送信する
        const signer = provider.getSigner();
        // コントラクトへの接続を行う（新しいコントラクトインスタンスを生成）
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        // makeAnEpicNFT 関数をコントラクトから呼び出し、await を使用して、NFT の発行が承認（＝マイニング）されるまで、処理を止める
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.")

        // 承認が終わったら、await nftTxn.wait() が実行され、トランザクションの結果を取得する
        await nftTxn.wait();
  
        // 取得したトランザクションの結果を、Etherscan URL として出力
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // renderNotConnectedContainer メソッドを定義します。
  // ユーザーのウォレットアドレスが、WEBアプリと紐づいていない場合は、「Connect to Wallet」のボタンがフロントエンドに表示されます。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // mintCounter
  const MintCounter = () => {
    const [mintCount, setCount] = useState(0);
    const { ethereum } = window;

    useEffect( () => {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      // mintCountを更新する関数handleEmitEventを定義
      const handleEmitEvent = (_from, tokenId) => {
        const latestMintCount = tokenId.toNumber();
        setCount(latestMintCount);
      };

      // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
      connectedContract.on("NewEpicNFTMinted", handleEmitEvent);

      return () => {
        connectedContract.off("NewEpicNFTMinted", handleEmitEvent);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <p  className="header-ethnft gradient-text">
        Mint数: {mintCount} / {MAX_SUPPLY}
      </p>
    );
  };

  /*
  * ページがロードされたときに useEffect()内の関数が呼び出されます。
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
     <div className="EthNft">
      <div className="container-ethnft">
        <div className="header-container-ethnft">
          <p className="header-ethnft gradient-text">My NFT Collection</p>
          <p className="sub-text">
          あなただけの特別な NFT を Mint しよう💫
          </p>

          {/*条件付きレンダリングを追加しました
          // すでに接続されている場合は、
          // Connect to Walletを表示しないようにします。
          // currentAccount === "" は、currentAccount にユーザーのウォレットアドレスが紐づいているかどうか判定
          // { currentAccount === "" ? ( currentAccount にアドレスが紐づいてなければ、A を実行 ) : ( currentAccount にアドレスが紐づいれば B を実行 )}*/}
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            /* ユーザーが Mint NFT ボタンを押した時に、askContractToMintNft 関数を呼び出します
            // currentAccount === "" は、currentAccount にユーザーのウォレットアドレスが紐づいているかどうか判定　*/
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          <p></p>
          {MintCounter()}
          {isLoading ? ( <p className="header-minting-ethnft">Now Minting...</p> ) : ( <p></p> )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text mgr-30"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <img alt="Rarible Logo" className="rarible-logo" src={raribleLogo} />
          <a
            className="footer-text"
            href={RARIBLE_LINK}
            target="_blank"
            rel="noreferrer"
          >My Collections</a>
        </div>
      </div>
    </div>
  );
};
export default EthNft;



// #3
// // useEffect と useState 関数を React.js からインポートしています。
// import React, { useEffect, useState } from "react";
// import './styles/App.css';
// import twitterLogo from './assets/twitter-logo.svg';
// // Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
// const TWITTER_HANDLE = 'あなたのTwitterのハンドルネームを貼り付けてください';
// const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;
// const App = () => {
//   /*
//   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
//   */
//   const [currentAccount, setCurrentAccount] = useState("");
//   /*この段階でcurrentAccountの中身は空*/
//   console.log("currentAccount: ", currentAccount);
//   /*
//   * ユーザーが認証可能なウォレットアドレスを持っているか確認します。
//   */
//   const checkIfWalletIsConnected = async () => {
//     const { ethereum } = window;
//     if (!ethereum) {
//         console.log("Make sure you have MetaMask!");
//         return;
//     } else {
//         console.log("We have the ethereum object", ethereum);
//     }
//     /*
// 		// ユーザーが認証可能なウォレットアドレスを持っている場合は、
//     // ユーザーに対してウォレットへのアクセス許可を求める。
//     // 許可されれば、ユーザーの最初のウォレットアドレスを
//     // accounts に格納する。
//     */
//    // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納する（複数持っている場合も加味、よって account's' と変数を定義している）
//     const accounts = await ethereum.request({ method: 'eth_accounts' });

//     // もしアカウントが一つでも存在したら、以下を実行。
//     if (accounts.length !== 0) {
//       // accountという変数にユーザーの1つ目（=Javascriptでいう0番目）のアドレスを格納
//       const account = accounts[0];
//       console.log("Found an authorized account:", account);
//       // currentAccountにユーザーのアカウントアドレスを格納
//       setCurrentAccount(account);
//     } else {
//       console.log("No authorized account found")
//     }
//   }
//   // renderNotConnectedContainer メソッドを定義します。
//   const renderNotConnectedContainer = () => (
//     <button className="cta-button connect-wallet-button">
//       Connect to Wallet
//     </button>
//   );
//   /*
//   * ページがロードされたときに useEffect()内の関数が呼び出されます。
//   */
//   useEffect(() => {
//     checkIfWalletIsConnected();
//   }, [])
//   return (
//      <div className="App">
//       <div className="container">
//         <div className="header-container">
//           <p className="header gradient-text">My NFT Collection</p>
//           <p className="sub-text">
//           あなただけの特別な NFT を Mint しよう💫
//           </p>
//           {/* メソッドを追加します */}
//           {renderNotConnectedContainer()}
//         </div>
//         <div className="footer-container">
//           <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
//           <a
//             className="footer-text"
//             href={TWITTER_LINK}
//             target="_blank"
//             rel="noreferrer"
//           >{`built on @${TWITTER_HANDLE}`}</a>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default App;



// #2
// // App.js
// import React, { useEffect } from "react";
// import './styles/App.css';
// import twitterLogo from './assets/twitter-logo.svg';
// // Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
// const TWITTER_HANDLE = 'あなたのTwitterのハンドルネームを貼り付けてください';
// const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;
// const App = () => {
//   const checkIfWalletIsConnected = () => {
//     /*
//     * ユーザーがMetaMaskを持っているか確認します。window.ethereum は MetaMask が提供する API
//     */
//     const { ethereum } = window;
//     if (!ethereum) {
//       console.log("Make sure you have MetaMask!");
//       return;
//     } else {
//       // これが表示されたらwindow.ethereumがWEBサイトを訪問したユーザーがMetaMaskを持っていることを確認したということになる
//       console.log("We have the ethereum object", ethereum);
//     }
//   }
//   // renderNotConnectedContainer メソッドを定義します。
//   const renderNotConnectedContainer = () => (
//     <button className="cta-button connect-wallet-button">
//       Connect to Wallet
//     </button>
//   );
//   /*
//   * ページがロードされたときに useEffect()内の関数が呼び出されます。
//   */
//   useEffect(() => {
//     checkIfWalletIsConnected();
//   }, [])
//   return (
//     <div className="App">
//       <div className="container">
//         <div className="header-container">
//           <p className="header gradient-text">My NFT Collection</p>
//           <p className="sub-text">
//             あなただけの特別な NFT を Mint しよう💫
//           </p>
//           {/* メソッドを追加します */}
//           {renderNotConnectedContainer()}
//         </div>
//         <div className="footer-container">
//           <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
//           <a
//             className="footer-text"
//             href={TWITTER_LINK}
//             target="_blank"
//             rel="noreferrer"
//           >{`built on @${TWITTER_HANDLE}`}</a>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default App;


// #1
// import './styles/App.css';
// import twitterLogo from './assets/twitter-logo.svg';
// import React from "react";

// // Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
// const TWITTER_HANDLE = 'あなたのTwitterのハンドルネームを貼り付けてください';
// const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;

// const App = () => {
//   // renderNotConnectedContainer メソッドを定義します。
//   const renderNotConnectedContainer = () => (
//     <button className="cta-button connect-wallet-button">
//       Connect to Wallet
//     </button>
//   );

//   return (
//     <div className="App">
//       <div className="container">
//         <div className="header-container">
//           <p className="header gradient-text">My NFT Collection</p>
//           <p className="sub-text">
//             あなただけの特別な NFT を Mint しよう💫
//           </p>
//           {renderNotConnectedContainer()}
//         </div>
//         <div className="footer-container">
//           <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
//           <a
//             className="footer-text"
//             href={TWITTER_LINK}
//             target="_blank"
//             rel="noreferrer"
//           >{`built on @${TWITTER_HANDLE}`}</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
