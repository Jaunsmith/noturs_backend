const app = require("./app");

// 4. SERVERS LISTNER
const port = 3000;
app.listen(port, () => {
  console.log(`app runing on port  ${port}...`);
});
