import React from 'react'
import profileImage from "../images/katoten.png";
import '../App.css';
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container text-center">
      <img src={profileImage} className="profileImage" alt="profile"/>
      <h3>Katoten</h3>
      <p>
        Web3 Developerを目指して日々精進しています！
      </p>

      <section class="page-section" id="portfolios">
        <div className="portfolio">
          <div class="row g-4 text-center">
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">Wave Portal</h4>
                <p class="text-muted">
                  UNCHAINのチュートリアル #1<br />
                  メッセージとWaveがブロックチェーンに保存されるよ！
                </p>
                <Link to="/EthDApp"><a href="#" class="go-button gradation-button">Go !!</a></Link>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">NFT Collection</h4>
                <p class="text-muted">
                  UNCHAINのチュートリアル #2<br />
                  名前が書かれたNFTがランダム生成されるよ！（おひとり様50個まで）
                </p>
                <Link to="/EthNft"><a href="#" class="go-button gradation-button">Go !!</a></Link>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">制作中だよ！</h4>
                <p class="text-muted">
                  待っててね！
                </p>
                <a href="#" class="go-button gradation-button">Go !!</a>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">#4</h4>
                <p class="text-muted">
                  #4
                </p>
                <a href="#" class="go-button gradation-button">Go !!</a>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">#5</h4>
                <p class="text-muted">
                  #5
                </p>
                <a href="#" class="go-button gradation-button">Go !!</a>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="service card-effect">
                <h4 class="my-3">#6</h4>
                <p class="text-muted">
                  #6
                </p>
                <a href="#" class="go-button gradation-button">Go !!</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage