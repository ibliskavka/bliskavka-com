cd bliskavka-com
npm run build
aws s3 sync dist s3://bliskavka-com-stack-app
cd ..