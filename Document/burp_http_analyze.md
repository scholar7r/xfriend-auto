# 使用 Burp 对校友邦小程序进行抓包分析

## 安装 Burp Suite Community Edition 抓包程序

Burp Suite 由 PortSwigger 开发并提供下载，提供专业版和社区版本下载。按需自取即可，下载安装社区版。
安装完成之后打开 Burp Suite，在 `Terms and Conditions` 界面，可选择关闭 `Helo improve Burp by submitting feedback about its performance`。
如此一来 Burp Suite 不会远程记录数据。

## 在 Burp Suite 上创建项目

对一个或多个的网站进行抓包，可以采用项目的方式进行管理，以便于处理抓取的接口和数据，方便后续的查找和使用。
Burp 默认提供了三种创建项目的选项，分别如下。

- Temporary project in memory 临时任务（数据存放在内存，关闭 Burp 即刻清理数据）
- New project on disk 持久任务（数据存放在硬盘，可持久化保存）
- Open existing project 打开已存在的项目

*在 Burp Suite Community Edition 中，仅提供临时任务，如果需要创建持久任务，需要使用 Burp Suite Professional*。

在确认之前的步骤没有问题之后，点击下一步会进入到配置文件选择页，如果无特殊需求，选用 `Use default config` 即可。

## 设置代理监听器

在 Burp Suite 控制面板的 Proxy 选项中存在 Proxy 选项，子选项中提供了 Proxy settings 选项。进入该选项，设置代理监听器。

添加地址为 `localhost 或 127.0.0.1` 且端口为 `8080` 的监听器，一般情况下 Burp Suite 内置了这个代理监听器，所以并不需要再次添加。
为保险起见，确保数据获取能够成功，该步骤检查很有必要。

## 安装 CA 证书

为确保能够正常抓取 HTTPS 流量，需要安装 Burp CA 证书。该证书允许 Burp Suite 代理服务器拦截和修改 HTTPS 流量。

在 Burp Suite 的设置中选择 Tools 中的 Proxy，在 Proxy Listeners 中有 Import / Export CA certificate 选项，单击导出 CA 证书到临时保存的目录。
Export 中提供了三个选项，分别如下。

- Certificate in DER format
- Private key in DER format
- Certificate and private key in PKCS#12 keystore

选择 Certificate in DER format 导出证书，另外两个选项分别是导出 DER 格式私钥和导出 PKCS#12 密码归档。

在选择好导出地址之后需要自定义文件名，且需要保证自定义的文件名是以 .der （DER 格式）为后缀的文件。
导出完成之后安装该证书，该证书的签发机构为 PostSwigger CA，后续如果要检查证书状态可以通过名称查找。

在配置完成之后可以在 Burp Suite 中打开浏览器测试，如果能够抓取 443 端口的流量并且数据包的内容正确，那么 CA 证书生效。

## 抓取校友邦小程序 API 数据包

XFriend Auto 需要实现签到、查询当月签到信息等操作，需要抓包的接口要求如下。

- 用户登录接口
- 签到信息接口
- 当月签到信息

用户登录接口在此处不提及，网络上存在很多登录接口的内容。在校友邦微信小程序签到统计页面抓包检查到了以下关键数据包。

```
POST /student/clock/PunchIn!historyList.action HTTP/2
Host: xcx.xybsyw.com
Cookie: JSESSIONID=(...)
Content-Length: 33
N: content,deviceName,keyWord,blogBody,blogTitle,getType,responsibilities,street,text,reason,searchvalue,key,answers,leaveReason,personRemark,selfAppraisal,imgUrl,wxname,deviceId,avatarTempPath,file,file,model,brand,system,deviceId,platform,code,openId,unionid,clockDeviceToken,clockDevice,address
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b13)XWEB/11159
Content-Type: application/x-www-form-urlencoded
V: 1.6.36

M: (...)

Xweb_xhr: 1
T: (...)
S: (...)
Accept: */*
Sec-Fetch-Site: cross-site
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://servicewechat.com/wx9f1c2e0bbc10673c/431/page-frame.html
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9

traineeId=83357645&months=2024-08
```

API 接口地址 `/student/clock/PunchIn!historyList.action`，除 Cookie 外，需要传入参数 traineeId 和 months 来查询用户当前月份的签到情况。
该接口的返回值为如下。最重要的数据在 `data.clockHistoryList[index].clockInTime`，


```
HTTP/2 200 OK
Date: Thu, 22 Aug 2024 09:30:59 GMT
Content-Type: application/json;charset=utf-8

Access-Control-Allow-Methods: *

Access-Control-Max-Age: 3600
Access-Control-Allow-Headers: DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,SessionTokenockInAddress":"浮山街道碧桂园酒店凤凰轩咸宁碧桂园凤凰温泉酒店","clockInDevice":"V2344A","clockInImgUrl":null,"clockInStatus":0,"clockInStatusDesc":"","clockInTime":"2024.08.01 08:13:18","clockOutAddress":null,"clockOutDevice":null,"clockOutImgUrl":null,"clockOutStatus":0,"clockOutStatusDesc":null,"clockOutTime":null,"clockRuleType":0,"clockStatus":0,"explanation":null,"physicalSymptoms":null,"situationUpload":false,"testResult":null}],"clockMonthCount":17,"clockTotalCount":31,"openEpidemicSituation":false,"openExplanation":false},"msg":"操作成功","mstv":{"t":1724319059,"m":"16070f2468beba1596142da0b1cdc69d","s":"11_40_33_19_59_51_26_57_1_7_29_21_37_34_24_43_27_47_30_6"}}
Access-Control-Allow-Credentials: true

P3p: CP=CAO PSA OUR

{
    "code": "200",
    "data": {
        "clockHistoryList": [
            {
                "clockCostHours": 0,
                "clockCostMinutes": 0,
                "clockInAddress": "(...)",
                "clockInDevice": "ASUS ROG Strix Gaming Laptop",
                "clockInImgUrl": null,
                "clockInStatus": 0,
                "clockInStatusDesc": "",
                "clockInTime": "2024.08.22 08:00:02",
                "clockOutAddress": null,
                "clockOutDevice": null,
                "clockOutImgUrl": null,
                "clockOutStatus": 0,
                "clockOutStatusDesc": null,
                "clockOutTime": null,
                "clockRuleType": 0,
                "clockStatus": 0,
                "explanation": null,
                "physicalSymptoms": null,
                "situationUpload": false,
                "testResult": null
            },
            ...
        ]
    }
}
```
