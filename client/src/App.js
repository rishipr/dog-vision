import React, { Component } from "react";
import axios from "axios";
import "./App.scss";

import Clock from "./Clock";
import Logo from "./Logo";
import ButtonList from "./ButtonList";

// http://127.0.0.1:8000
// https://dogvision-server.herokuapp.com
const API_ENDPOINT = "https://dogvision-server.herokuapp.com";
const API_CLIENT = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 30000,
});

const isMobile =
  typeof navigator !== "undefined" &&
  (/Android|Mobi|iPhone|iPad|iPod|BlackBerry|Windows Phone|ZuneWP7|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) ||
    navigator.userAgent.indexOf("Mobile") > 0);

class App extends Component {
  state = {
    imgSrc: "",
    loading: false,
    predictions: [],
    errMsg: null,
    herokuAwake: false,
    message: "Drag a .jpg of one of the above breeds into the box (< 300kb)",
  };

  componentDidMount() {
    this.wakeUpHeroku();
  }

  // Recursive function to wakeup Heroku Dyno
  wakeUpHeroku() {
    let { herokuAwake } = this.state;
    if (herokuAwake) {
      return;
    }

    API_CLIENT.get("/")
      .then(() => {
        console.log("Heroku dyno up...");
        this.setState({ herokuAwake: true });

        return;
      })
      .catch((err) => {
        let errMsg = err.toString();
        if (errMsg.includes("timeout") && errMsg.includes("exceeded")) {
          console.log("Heroku spinning up...");
          this.wakeUpHeroku();
        }
      });
  }

  _onDragOver(e) {
    e.preventDefault();
  }

  _onDragLeave(e) {
    e.preventDefault();
  }

  _onDrop(e) {
    e.preventDefault();
    this.setState({
      predictions: [],
      loading: true,
      message: "Classifying...",
    });

    // Get image data
    let targetFile = e.dataTransfer.files[0];
    if (!targetFile || targetFile.type !== "image/jpeg") {
      this.setState({
        loading: false,
        message: "Failed to classify: File must be a .jpg",
      });
      return;
    }

    // Size in KB
    let size = targetFile.size / 1000;
    if (size > 300) {
      this.setState({
        loading: false,
        message: "Failed to classify: File must be < 300kb",
      });
      return;
    }

    // Display image in UI
    let reader = new FileReader();
    reader.readAsDataURL(targetFile);
    reader.onloadend = (e) => {
      this.setState({ imgSrc: reader.result });
    };

    // Post image data to API
    let data = new FormData();
    data.append("image", targetFile);

    API_CLIENT.post("/classify", data, {
      headers: { "Content-Type": targetFile.type },
    })
      .then((res) => {
        this.setState({
          predictions: res.data.breedPredictions,
          message:
            "Drag a .jpg of one of the above breeds into the box (< 300kb)",
        });
      })
      .catch((err) => {
        this.setState({
          message: `Failed to classify: ${err.message}.`,
        });

        if (
          err.message.includes("Network Error") &&
          typeof window !== undefined
        ) {
          this.setState({
            message: this.state.message + " Restarting Heroku dyno.",
          });
          // setTimeout(() => window.location.reload(), 5000);
        }
      })
      .finally(() => this.setState({ loading: false }));
  }

  render() {
    let { imgSrc, predictions, loading, message, herokuAwake } = this.state;
    let imgPreview;

    if (imgSrc) {
      imgPreview = <img src={this.state.imgSrc} alt="Doge" />;
    }

    if (isMobile) {
      return (
        <div className="container">
          <Logo />
          <h1>Dog Classifier</h1>
          <p>This app is not optimized for mobile devices.</p>
          <ButtonList />
        </div>
      );
    } else if (!herokuAwake) {
      return (
        <div className="container">
          <Logo />
          <h1>Dog Classifier</h1>
          <p>Heroku dyno spinning up...</p>
          <Clock />
          <ButtonList />
        </div>
      );
    } else
      return (
        <div className="container">
          <Logo />
          <h1>Dog Classifier</h1>
          <p>
            Available breeds: 'golden retriever', 'yorkshire terrier', 'german
            shepherd', 'corgi', 'husky', 'dalmatian', 'newfoundland'
          </p>
          <p>{message}</p>
          <div
            className="file-dropzone"
            onDragOver={(e) => this._onDragOver(e)}
            onDragLeave={(e) => this._onDragLeave(e)}
            onDrop={(e) => this._onDrop(e)}
          >
            {imgPreview}
          </div>
          <div className="predictions">
            {predictions.length > 0 &&
              (loading ? null : (
                <p>
                  {/* Get highest ranked prediction */}
                  {predictions[0][0]}: {Math.round(predictions[0][1] * 100, 1)}%
                  confidence
                </p>
              ))}
          </div>
          <ButtonList />
        </div>
      );
  }
}

export default App;
