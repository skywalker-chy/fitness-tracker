# Expo Android APK 打包指南

本指南将帮助你使用 EAS Build 生成可安装的 Android APK 文件。

## 📋 前置条件

- ✅ Node.js 已安装
- ✅ Expo 项目已配置好 `app.json`
- ✅ `eas-cli` 已全局安装 (`npm install -g eas-cli`)

## 🚀 快速开始

### 第一步：登录 Expo 账号

```bash
eas login
```

如果没有账号，先在 https://expo.dev/signup 注册一个免费账号。

### 第二步：初始化 EAS 配置

```bash
eas build:configure
```

这会在项目中创建 `eas.json` 配置文件。

### 第三步：配置 eas.json

确保 `eas.json` 包含以下配置（用于生成 APK 而不是 AAB）：

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 第四步：构建 APK

**方式一：Preview 版本（推荐测试用）**
```bash
eas build --platform android --profile preview
```

**方式二：Production 版本（正式发布用）**
```bash
eas build --platform android --profile production
```

### 第五步：下载 APK

构建完成后，你会得到一个下载链接，也可以在 https://expo.dev 的项目页面找到构建好的 APK。

---

## ⚙️ 配置说明

### app.json 当前配置

```json
{
  "expo": {
    "name": "健身记录助手",
    "slug": "fitness-tracker",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.caihaoyuan.inspiration"
    },
    "android": {
      "package": "com.caihaoyuan.inspiration"
    }
  }
}
```

### 构建类型说明

| Profile | 用途 | 输出格式 |
|---------|------|----------|
| `development` | 开发调试 | 包含开发工具 |
| `preview` | 内部测试 | APK（可直接安装） |
| `production` | 正式发布 | APK 或 AAB |

---

## 🔧 常用命令

```bash
# 登录 Expo
eas login

# 查看登录状态
eas whoami

# 初始化 EAS
eas build:configure

# 构建 Android APK（测试版）
eas build --platform android --profile preview

# 构建 Android APK（正式版）
eas build --platform android --profile production

# 查看构建状态
eas build:list

# 取消正在进行的构建
eas build:cancel
```

---

## 📱 安装 APK

1. 将 APK 文件传输到 Android 手机
2. 在手机上打开 APK 文件
3. 如果提示"未知来源"，需要在设置中允许安装
4. 按提示完成安装

---

## ❓ 常见问题

### Q1: 构建失败怎么办？
- 检查 `app.json` 配置是否正确
- 确保 `android.package` 格式正确（如 `com.xxx.xxx`）
- 查看 EAS 构建日志获取详细错误信息

### Q2: 如何更新版本号？
在 `app.json` 中修改：
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### Q3: 免费账号有什么限制？
- 每月 30 次构建
- 构建可能需要排队等待
- 足够个人项目使用

---

## 🎯 一键构建脚本

在项目根目录执行以下命令即可开始构建：

```bash
# 第一次使用需要先登录和配置
eas login
eas build:configure

# 然后构建 APK
eas build --platform android --profile preview
```

构建大约需要 10-20 分钟，完成后会提供下载链接。

---

## 📞 相关链接

- Expo 官网: https://expo.dev
- EAS Build 文档: https://docs.expo.dev/build/introduction/
- Expo 账号注册: https://expo.dev/signup
