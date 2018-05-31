# 有货BI报表工具

依赖环境：>=node@8.9.1、mysql、pg

## 1.配置数据库：

配置文件位置：/server/common/database.json

```
{
  "username": "root",
  "password": "",
  "database": "bi_dashboard",
  "port": "3306",
  "host": "127.0.0.1",
  "dialect": "mysql",
  "pool": {
    "max": 5,
    "min": 0,
    "acquire": 30000,
    "idle": 10000
  },
  "seederStorage": "sequelize"
}
```

## 2.安装依赖库并自动创建数据库：

```
yarn
yarn db:create
```

## 3.启动本地调试
```
yarn dev //启动node服务器
yarn static //启动本地前端调试
```


## 4.登录
初始账号：

账号：admin

密码：admin123


## README 未完待续...