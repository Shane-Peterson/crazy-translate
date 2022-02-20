import * as https from "https";
import md5 from "md5";
import {appId, appSecret} from "./private";

type ErrorMap = {
  [k: string]: string | undefined
}

const errorMap: ErrorMap = {
  "52000": "成功",
  "52001": "请求超时，请重试",
  "52002": "系统错误，请重试",
  "52003": "未授权用户，请检查appid是否正确或者服务是否开通",
  "54000": "必填参数为空，请检查是否少传参数",
  "54001": "签名错误，请检查您的签名生成方法",
  "54003": "访问频率受限，请降低您的调用频率，或进行身份认证后切换为高级版/尊享版",
  "54004": "账户余额不足，请前往管理控制台为账户充值",
  "54005": "长query请求频繁，请降低长query的发送频率，3s后再试",
  "58000": "客户端IP非法，检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改",
  "58001": "译文语言方向不支持，检查译文语言是否在语言列表里",
  "58002": "服务当前已关闭，请前往管理控制台开启服务",
  "90107": "认证未通过或未生效"
}

export const translate = (word: string) => {

  const urlObject = {
    "q": word,
    "from": "en",
    "to": "zh",
    "appid": appId,
    "salt": Math.random(),
    "sign": ""
  }
  if (!(/[a-z0-9A-Z]/.test(word[0]))) {
    urlObject.from = "zh"
    urlObject.to = "en"
  }
  urlObject.sign = md5(urlObject.appid + urlObject.q + urlObject.salt + appSecret)
  const query = new URLSearchParams(JSON.parse(JSON.stringify(urlObject)));
  const options = {
    hostname: 'fanyi-api.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };
  const request = https.request(options, (response) => {
    let chunks :Buffer[] = []
    response.on('data', (chunk) => {
      chunks.push(chunk)
    })
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString()
      type BaiduResult = {
        error_code?: string;
        error_msg?: string;
        from: string;
        to: string;
        trans_result: {
          src: string;
          dst: string;
        }[]
      }
      const object: BaiduResult = JSON.parse(string)
      if (object.error_code) {
        console.error(errorMap[object.error_code] || object.error_msg);
        process.exit(2)
      } else {
        object.trans_result.forEach((element) => {
          console.log(element.dst);
        });
        process.exit(0)
      }
    })
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
}