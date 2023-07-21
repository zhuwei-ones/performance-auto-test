# 开发阅读

## 安装

```sh
npm i
```

## 开发

**开发**

```sh
npm run watch
```

## 发布

```sh

# 打版本
npm run release # 补丁版本，bug 修复，向下兼容。
npm run release-minor # 次版本号，添加功能或者废弃功能，向下兼容；
npm run release-major # 主版本号，软件做了不兼容的变更（breaking change 重大变更）；
npm run release -- --release-as 1.x.x # 定制版本

# 打包
npm run build

# 发布到私有源

# 私有源信息参考：https://our.ones.pro/wiki/?from_wecom=1#/team/RDjYMhKq/space/H8a3Zh9m/page/PgNzT55o

# 用私有源账号登录之后发布
npm login --registry=https://npm2.myones.net/

npm publish --registry=https://npm2.myones.net/


```

发布之后，可以到这里查看 https://npm.myones.net/package/@ones-ai/performace-auto-test
