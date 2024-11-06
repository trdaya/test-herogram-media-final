export const pinoLoggerConfig = {
  pinoHttp: {
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          options: { colorize: true },
        },
        {
          target: 'pino/file',
          options: { destination: './logs/app.log' },
        },
      ],
    },
  },
};
