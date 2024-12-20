aws s3 sync ../dist s3://elpriser.dasoji.net/ 
aws s3 website s3://elpriser.dasoji.net/ --index-document index.html --error-document index.html
aws s3api put-bucket-policy --bucket elpriser.dasoji.net --policy file://policy.json
