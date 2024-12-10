# How to use this project

This project is a serverless lambda function that can be used to generate a featured image for a news post. The image is generated using the title of the post as well as a sentiment analysis of the post. The image is then uploaded to a WordPress site using the WordPress REST API.

# How to Deploy

This lambda runs on aws environment, that environment runs on Linux. canvas node uses binaries specific for Linux on that env hence we cannot straightup zip node_modules from MacOS or Windows. To circunvent this, follow the steps below:

**Step 1: Upload package.json to a AWS Cloudshell**
Upload this project's package.json to a AWS Cloudshell. This will allow you to install the dependencies on a Linux environment.

**Step 2: Install dependencies on AWS Cloudshell**
Run `npm install` on the AWS Cloudshell to install the dependencies.

**Step 3: Zip the dependencies**
Zip the installed dependencies from the AWS Cloudshell. This will ensure that you have the correct binaries for the Linux environment.

**Step 4: Unzip dependencies on the source folder**
Unzip the zipped dependencies on the source folder of this lambda. This will place the dependencies alongside the source code.

**Step 5: Zip the source and dependencies**
Zip the source code and the dependencies together. This will create a zip file that can be uploaded to AWS S3.

**Step 6: Upload the zip to AWS S3**
Upload the zipped file to AWS S3.

**Step 7: Upload the lambda from S3 bucket**
Upload the lambda from the S3 bucket.

# How the lambda works

The lambda is triggered by an API Gateway endpoint. The endpoint expects the following parameters to be passed in the request body:

- `title`: The title of the news post.
- `content`: The content of the news post.
- `backend`: The URL of the WordPress site to upload the image to.

The lambda function analyzes the content of the post and generates a tagline, sentiment and company logo. The tagline is then used to generate a featured image. The image is then uploaded to the WordPress site using the WordPress REST API.

# Functions in index.js

Below is a description of each function in `index.js` along with an explanation of their parameters:

1. **generateFeaturedImage(title, sentiment, logoPath)**:

   - **title**: The title of the news post which will be used to generate the image.
   - **sentiment**: The sentiment analysis result of the post content, affecting image styling.
   - **logoPath**: The file path to the company logo to be included in the image.

2. **analyzeContent({ title, content })**:

   - **title**: The title of the news post that will be analyzed for sentiment and other features.
   - **content**: The full text of the news post that will be analyzed for sentiment and other features.

3. **uploadImage(imagePath, backendUrl)**:
   - **imagePath**: The local path to the generated image that will be uploaded.
   - **backendUrl**: The URL of the WordPress site where the image will be uploßaded using the REST API.

# How Manually Bulk Update News for a Wordpress backend

The `manual-wordpress-bulk-update.js` script is used to bulk update featured images for all posts on a WordPress site.

The script expects the following parameters to be passed as environment variables:

- **WORDPRESS_URL**: The URL of the WordPress site to update.
- **WORDPRESS_USERNAME**: The username of a user with sufficient permissions to update posts on the WordPress site.
- **WORDPRESS_PASSWORD**: The password of the user.
- **APP_PASSWORD**: The app password for the user.

The script works by looping through the `NEWS_DICT` object and for each post, it calls the `mainProcess` function with the title, content and backend. The `mainProcess` function generates a featured image and returns a response with the ID of the generated media. The script then updates the news post with the generated featured media using the WordPress REST API.

The script logs a message with the ID of the generated media and the slug of the updated post for each post in the `NEWS_DICT` object.
