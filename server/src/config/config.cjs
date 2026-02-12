// server/config/config.cjs
module.exports = {
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "mysql",
    logging: false,
  },
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "mysql",
    logging: false,
  },
};
