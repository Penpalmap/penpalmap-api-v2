import mailjet from "node-mailjet";

export const mailjetConfig = mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC ?? "public-key",
  process.env.MJ_APIKEY_PRIVATE ?? "private-key",
  {
    config: {},
    options: {},
  }
);
