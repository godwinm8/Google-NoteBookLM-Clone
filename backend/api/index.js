import app from "../src/server";

export default function handler(req, res) {
  return app(req, res);
}
