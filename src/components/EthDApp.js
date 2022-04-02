import React, { useEffect, useState } from "react";
import "./styles/ethdapp.css";
/* ethers 変数を使えるようにする*/
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/WavePortal.json";

const EthDApp = () => {
  // ユーザーの情報を保存するために使用する変数と関数を定義し、初期化する
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します */
  // ユーザーのパブリックウォレットを格納する変数（＝ currentAccount ）、ユーザーのパブリックウォレットを更新する関数（＝ setCurrentAccount ）
  const [currentAccount, setCurrentAccount] = useState("");
  /* ユーザーのメッセージを保存するために使用する状態変数を定義 */
  // ユーザーのメッセージを格納する変数（＝ messageValue ）、ユーザーのメッセージを更新する関数（＝ setMessageValue ）
  const [messageValue, setMessageValue] = useState("")
  /* すべてのwavesを保存する状態変数を定義 */
  // 現在の waves の状態を格納する変数（＝ allWaves ）、現在の waves の状態を更新する関数（＝ setAllWaves ）
  const [allWaves, setAllWaves] = useState([]);
  console.log("currentAccount: ", currentAccount);

  // Rinkebyなどにデプロイされたコントラクトのアドレスを保持する変数を作成
  const contractAddress = "0x93aDD78401a73a7fcE53CFe6cAB7359d69E8599e";
  /*この段階でcurrentAccountの中身は空*/
  // console.log("currentAccount: ", currentAccount);

  /* コントラクトからすべてのwavesを取得するメソッドを作成 */
  // ABIの内容を参照する変数を作成
  const contractABI = abi.abi;
  const getAllWaves = async () => { // waves関数とほぼ同じ仕様
    const { ethereum } = window;
  
    try {
      if (ethereum) {
        // provider (= MetaMask) を設定し、フロントエンドがMetaMaskを通してイーサリアムノードに接続できるようになる
        const provider = new ethers.providers.Web3Provider(ethereum);
        // ユーザーのウォレットアドレス (= signer）を設定
        const signer = provider.getSigner();
        // コントラクトのインスタンス（= wavePortalContract）を生成し、コントラクトへの接続を行う
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        /* コントラクトからgetAllWavesメソッドを呼び出す */
        const waves = await wavePortalContract.getAllWaves();
        /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定 */
        // .map()メソッドでwaves配列をループして配列内の各要素を返す（address:waveしたユーザーのアドレス、timestamp:waveのタイムスタンプ、message:waveと共に送信されたメッセージ）
        // ここでgetAllWaves 関数の中に wavesCleaned 関数を実装して、WEBアプリからアドレス、タイムスタンプ、メッセージを取得できるようにしています。
        // map メソッドによってwaveしたユーザーのアドレス（＝ address ）、送信した時間（＝ timestamp ）、付随するメッセージ（＝ message ）のデータが、wavesCleaned に格納される
        const wavesCleaned = waves.map(wave => {
          return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
          };
        });
  
        /* React Stateにデータを格納する（AllWaves の状態を更新） */
        setAllWaves(wavesCleaned);
      } else {
      console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  /**
   * `emit`されたイベントに反応する
   */
  useEffect(() => {
    let wavePortalContract;
  
    // NewWaveイベントがemitされたときにfrom:senderのアドレス、timestamp:senderがNewWaveをemitしたときのタイムスタンプ、message:messageの情報を取得する
    // このコードを実装することでフロントエンドからこれらのデータにアクセスできるようになる
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      // NewWaveイベントをフロントエンドが受け取ったときsetAllWavesを実行する
      // NewWaveイベントがemitされたとき、これらの情報がwaves配列に追加される
      // これによりWebアプリのフロントエンドに反映するデータを自動更新できるようになる（onNewWave関数はNewWaveのイベントリスナーの働きをしている）
      // イベントリスナーとは「ページが表示された」、「ボタンをクリックした」などの動作のことを表します。ここでは、「フロントエンドでユーザーが wave を送った」動作を受け取ります。
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    /* NewWaveイベントがコントラクトから発信されたときに、情報をを受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      // ここで上記で定義したonNewWaveが呼び出される
      wavePortalContract.on("NewWave", onNewWave);
    }
    /*メモリリークを防ぐために、NewWaveのイベントを解除します*/
    return () => {
      if (wavePortalContract) {
      // フロントエンドは、NewWave イベントがコントラクトから発信されたときに、情報を受け取ります。これにより、情報がフロントエンドに反映されます
      // このことを、コンポーネント（情報）がマウント（フロントエンドに反映）されると言います。
      wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  /* window.ethereumにアクセスできることを確認します */
  const checkIfWalletIsConnected = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      // window.ethereum というMetaMask が提供する API を呼び出している
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
      // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納する（複数持っている場合も加味、よって account's' と変数を定義している）
      const accounts = await ethereum.request({ method: "eth_accounts" });
      // もしアカウントが一つでも存在したら、以下を実行。
      if (accounts.length !== 0) {
        // accountという変数にユーザーの1つ目（=Javascriptでいう0番目）のアドレスを格納
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        // currentAccountにユーザーのアカウントアドレスを格納
        setCurrentAccount(account)
      } else {
        // アカウントが存在しない場合は、エラーを出力。
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // connectWalletメソッドを実装
  const connectWallet = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  // waveの回数をカウントする関数を実装
  const wave = async () => {
    try {
      // ユーザーがMetaMaskを持っているか確認
      const { ethereum } = window;
      if (ethereum) {
        // provider (= MetaMask) を設定する
        const provider = new ethers.providers.Web3Provider(ethereum);
        // provider.getSigner() を呼び出すだけで、ユーザーはウォレットアドレスを使用してトランザクションに署名し、そのデータをイーサリアムネットワークに送信することができる
        // provider.getSigner() は新しい signer インスタンスを返すので、それを使って署名付きトランザクションを送信することができる
        const signer = provider.getSigner();
        // コントラクトへの接続を行うため、コントラクトの新しいインスタンスを作成するには、以下3つの変数を ethers.Contract 関数に渡す必要がある
        // コントラクトのデプロイ先のアドレス、コントラクトの ABI、provider、もしくは signer
        // コントラクトインスタンスでは、コントラクトに格納されているすべての関数を呼び出すことができる
        // providerはそのインスタンスは読み取り専用の機能しか実行できない、signerはそのインスタンスは読み取りと書き込みの両方の機能を実行できる
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // コントラクトの現在の資金額を Console に出力
        let contractBalance = await provider.getBalance(
          wavePortalContract.address
        );
        console.log(
          "Contract balance:",
          ethers.utils.formatEther(contractBalance)
        );
        
        // コントラクトにwaveを書き込む
        const waveTxn = await wavePortalContract.wave(messageValue,{gasLimit:300000})
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        let contractBalance_post = await provider.getBalance(wavePortalContract.address);
        /* コントラクトの残高が減っていることを確認 */
        if (contractBalance_post < contractBalance){
          /* 減っていたら下記を出力 */
          console.log("User won ETH!");
        } else {
          console.log("User didn't win ETH.");
        }
        console.log(
          "Contract balance after wave:",
          ethers.utils.formatEther(contractBalance_post)
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // WEBページがロードされたときに下記の関数を実行します。
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="hand-wave">👋</span> WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「<span role="img" aria-label="hand-wave">👋</span>(wave)」を送ってください<span role="img" aria-label="shine">✨</span>
        </div>
        {/* ウォレットコネクトのボタンを実装 */}
        {/* currentAccountが存在しない場合は、「Connect Wallet」ボタンを実装*/}
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
        </button>
        )}
        {/* currentAccountが存在する場合は、「Wallet Connected」ボタンを実装*/}
        {currentAccount && (
        <button className="waveButton">
            Wallet Connected
        </button>
        )}
        {/* waveボタンにwave関数を連動させる。*/}
        {currentAccount && (
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>)
        }
        {/* メッセージボックスを実装*/}
        {/* 認証済みのアドレス（＝ currentAccount ）が存在する場合に、テキストボックスを UI に表示する*/}
        {currentAccount && (<textarea name="messageArea"
            placeholder="メッセージはこちら"
            type="text"
            id="message"
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)} />)
        }
        {/* 履歴を表示する */}
        {currentAccount && (
        allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "#F8F8FF", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })
        )}
      </div>
    </div>
  );
}

export default EthDApp;