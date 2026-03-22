import { 
    App, 
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

// Create the app
const app = new App( document.getElementById( "app" ), options );

// Register Plugins (Microkernel Architecture)
app.use(new StandardToolbarPlugin());
app.use(new ContextMenuPlugin());
app.use(new StatusbarPlugin());
app.use(new ValidationPlugin());
app.use(new PdfExportPlugin());
app.use(new MidiPlayerPlugin());
app.use(new GitHubPlugin());

// Views
app.use(new DocumentViewPlugin());
app.use(new ResponsiveViewPlugin());
app.use(new XmlEditorPlugin());

// Initialize all plugins and wait for app core to be ready
Promise.all([app.initPlugins(), app.ready]).then(() => {
    let file = 'examples/puccini.mei';
    let convert = false;
    let onlyIfEmpty = true;
    let urlFile = getParameterByName( 'file' );
    if (urlFile != null )
    {
        file = urlFile;
        onlyIfEmpty = false;
    }
    if ( getParameterByName( 'musicxml' ) != null ) convert = false;

    // Load a file (MEI, MusicXML, or CMME)
    fetch( file )
        .then( function ( response )
        {
            if ( response.status !== 200 )
            {
                alert( 'File could not be fetched, loading default file');
                throw new Error( "Not 200 response" );
            }
            return response.text();
        } )
        .then( function ( text )
        {
            app.loadData( text, file.substring(file.lastIndexOf("/") + 1), convert, onlyIfEmpty );
        } );
});
