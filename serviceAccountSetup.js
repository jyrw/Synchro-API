import fs from "fs";

fs.writeFile(process.env.SERVICE_ACCOUNT_FILE, process.env.SERVICE_ACCOUNT, (err) => {});