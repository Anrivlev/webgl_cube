npm init --y
npm i -D wepack-cli webpack typescript ts-loader declaration-bundler-webpack-plugin copy-webpack-plugin clean-webpack-plugin @types/node @types/webpack
tsc --init
npx webpack-cli init

npm install raw-loader --save-dev

npm i eslint-config-airbnb
npm install eslint-webpack-plugin --save-dev
npm install eslint --save-dev
npx install-peerdeps --dev eslint-config-airbnb
npm install @typescript-eslint/eslint-plugin@latest --save-dev
npm install eslint-plugin-prettier@latest --save-dev
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
npm install --save-dev --save-exact prettier

npx prettier ./ --write
