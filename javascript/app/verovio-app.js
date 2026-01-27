function loadScript( src, callback )
{
  const script = document.createElement( "script" );
  script.src = src;
  script.async = true;
  script.onload = callback;
  document.head.appendChild( script );
}

// Load the midi player
loadScript( "https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/html-midi-player@1.5.0", () =>
{
  console.log( "Tone.js, Magenta.js, and HTML-MIDI-Player loaded" );
} );

// Load pako
loadScript( "https://cdnjs.cloudflare.com/ajax/libs/pako/1.0.11/pako.min.js", () =>
{
  console.log( "Pako loaded" );
} );

import { VerovioApp } from '../../dist/verovio-app.js';
( function ()
{
  window.Verovio = window.Verovio || {};
  window.Verovio.App = VerovioApp;
} )();
