import { 
    VerovioEditor, 
    DocumentViewPlugin, 
    ResponsiveViewPlugin, 
    XmlEditorPlugin, 
    StandardToolbarPlugin, 
    MidiPlayerPlugin, 
    GitHubPlugin, 
    StatusbarPlugin, 
    ContextMenuPlugin,
    ValidationPlugin,
    PdfExportPlugin
} from "./ts/index.ts";

function getParameterByName( name )
{
    var match = RegExp( '[?&]' + name + '=([^&]*)' ).exec( window.location.search );
    return match && decodeURIComponent( match[1].replace( /\+/g, ' ' ) );
}

const options =
{
    documentViewSVG: false,
    enableDocument: true,
    enableResponsive: true,
    enableEditor: true,
    defaultView: 'editor',
    enableValidation: true,
    version: '1.0.0'
}

let isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
if ( isSafari )
{
    options.isSafari = true;
    options.enableValidation = false;
}

let view = getParameterByName( 'view' );
if ( view != null )
{
    options.defaultView = view;
}

// Rescue option to reset to default before loading
if ( getParameterByName( 'reset' ) != null ) options.appReset = true;

// Create the editor with plugins in the constructor
const editor = new VerovioEditor(
  document.getElementById("app"),
  options,
  [
    new StandardToolbarPlugin(),
    new ContextMenuPlugin(),
    new StatusbarPlugin(),
    new ValidationPlugin(),
    new PdfExportPlugin(),
    new MidiPlayerPlugin(),
    new GitHubPlugin(),
    new DocumentViewPlugin(),
    new ResponsiveViewPlugin(),
    new XmlEditorPlugin(),
  ]
);

let file = 'examples/puccini.mei';
let urlFile = getParameterByName( 'file' );
if ( urlFile != null ) file = urlFile;

// Load the data - This will wait internally until the editor is ready
fetch( file )
    .then( response => response.text() )
    .then( text => {
        editor.loadData( text, file.substring(file.lastIndexOf("/") + 1) );
    } );
