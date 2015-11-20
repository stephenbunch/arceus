export default function({ port }) {
  if ( process.send ) {
    process.send({
      status: 'online',
      port
    });
  }
};
