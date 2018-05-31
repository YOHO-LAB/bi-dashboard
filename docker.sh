cd $1
rm -rf yoho-bi-dashboard.tar.gz
yarn --production=false
yarn build
yarn db:migrate
yarn db:seed:all
tar -czvf yoho-bi-dashboard.tar.gz *