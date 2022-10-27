# manga-translator

Manga translator app using Vision API, Translation API
Rendered using React and canvas

## Installation

1. [Create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects), enable Vision API and Translation API
2. Clone the repo
   ```sh
   git clone https://github.com/huylhd/manga-translator.git
   cd translate-image-text
   ```
3. Install dependencies using yarn

   For backend

   ```sh
    yarn
   ```

   For frontend

   ```sh
    cd frontend && yarn
   ```

4. Create an `.env` file and enter your GCloud API key
   ```sh
   echo "API_KEY=your_api_key" > .env
   ```
5. Run the project
   ```sh
   yarn start
   ```
