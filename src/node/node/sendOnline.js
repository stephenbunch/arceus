export default function({ port }) {
  if ( process.send ) {
    process.send(
      JSON.stringify({
        status: 'online',
        port
      })
    );
  }
};
