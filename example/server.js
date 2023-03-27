const Koa = require("koa");

function server() {
  return new Promise((res) => {
    const app = new Koa()
      .use(require("koa-static")(`${process.cwd()}/example`, {}))
      .listen(8091, () => {
        console.log("listening on port 8090");
        res(app);
      })
  });
}


module.exports =server