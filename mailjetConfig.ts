import mailjet from "node-mailjet";

export const mailjetConfig = mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC as string,
  process.env.MJ_APIKEY_PRIVATE as string,
  {
    config: {},
    options: {},
  }
);
