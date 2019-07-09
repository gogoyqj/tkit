files="
node_modules/ts-polyfill/dist/ts-polyfill.min.js
node_modules/react/umd/react.production.min.js
node_modules/react-dom/umd/react-dom.production.min.js
node_modules/redux/dist/redux.min.js
node_modules/react-redux/dist/react-redux.min.js
node_modules/react-router/umd/react-router.min.js
node_modules/react-router-dom/umd/react-router-dom.min.js
node_modules/prop-types/prop-types.min.js
node_modules/reselect/dist/reselect.js
node_modules/redux-actions/dist/redux-actions.min.js
node_modules/redux-saga/dist/redux-saga.min.js
node_modules/eventemitter3/umd/eventemitter3.min.js
node_modules/json3/lib/json3.min.js
node_modules/moment/min/moment.min.js
";
umd=public/assets/lib.umd.min.js
if [ -f $umd ];then
  rm $umd
fi
for file in $files;do
  echo "" >> $umd
  if [ "${file/.min/}" == $file ];then
    cat $file >> $umd
  else
    node_modules/.bin/uglifyjs $file >> $umd
  fi
done

cp -rf node_modules/\@ant-design/icons/lib/umd.js public/assets/antd.icons.min.js