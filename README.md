# translate-image-text

Translate text in images using Vision API, Translation API and Jimp

![Alt text](public/images/ti2.gif?raw=true "GIF")

## Installation

1. [Create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects), enable Vision API and Translation API
2. Clone the repo and install dependencies
   ```sh
   git clone https://github.com/huylhd/translate-image-text.git
   ```
   ```sh
   cd translate-image-text && yarn
   ```
3. Create an `.env` file and enter your GCloud API key
   ```sh
   echo "API_KEY=your_api_key" > .env
   ```
4. Run the project
   ```sh
   yarn start
   ```
