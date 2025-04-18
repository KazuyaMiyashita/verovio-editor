/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { App } from '../app.js';
import { DocumentView } from '../document/document-view.js';
import { EditorPanel } from '../editor/editor-panel.js';
import { ResponsiveView } from '../verovio/responsive-view.js';
import { Toolbar } from './toolbar.js';

import { appendDivTo } from '../utils/functions.js';

export class AppToolbar extends Toolbar {
    private readonly viewDocument: HTMLDivElement;
    private readonly viewResponsive: HTMLDivElement;
    private readonly viewSelector: HTMLDivElement;
    private readonly viewEditor: HTMLDivElement;

    private readonly subSubMenu: HTMLDivElement;

    private readonly editorSubToolbar: HTMLDivElement;
    private readonly midiPlayerSubToolbar: HTMLDivElement;
    private readonly pageControls: HTMLDivElement;
    private readonly nextPage: HTMLDivElement;
    private readonly prevPage: HTMLDivElement;

    private readonly fileImportMusicXML: HTMLDivElement;
    private readonly fileImport: HTMLDivElement;
    private readonly fileMenuBtn: HTMLDivElement;
    private readonly fileRecent: HTMLDivElement;
    private readonly fileSelection: HTMLDivElement;

    private readonly zoomControls: HTMLDivElement;
    private readonly zoomIn: HTMLDivElement;
    private readonly zoomOut: HTMLDivElement;

    private readonly settingsEditor: HTMLDivElement;
    private readonly settingsVerovio: HTMLDivElement;

    private readonly helpReset: HTMLDivElement;
    private readonly helpAbout: HTMLDivElement;

    private readonly loginGroup: HTMLDivElement;
    private readonly login: HTMLDivElement;
    private readonly logout: HTMLDivElement;
    private readonly githubMenu: HTMLDivElement;
    private readonly githubImport: HTMLDivElement;
    private readonly githubExport: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.active = true;

        let iconsArrowLeft = `${app.host}/icons/toolbar/arrow-left.png`;
        let iconsArrowRight = `${app.host}/icons/toolbar/arrow-right.png`;
        let iconsDocument = `${app.host}/icons/toolbar/document.png`;
        let iconsEditor = `${app.host}/icons/toolbar/editor.png`;
        let iconsGithubSignin = `${app.host}/icons/toolbar/github-signin.png`;
        let iconsLayout = `${app.host}/icons/toolbar/layout.png`;
        let iconsResponsive = `${app.host}/icons/toolbar/responsive.png`;
        let iconsZoomIn = `${app.host}/icons/toolbar/zoom-in.png`;
        let iconsZoomOut = `${app.host}/icons/toolbar/zoom-out.png`;
        let iconsSettings = `${app.host}/icons/toolbar/settings.png`;

        ////////////////////////////////////////////////////////////////////////
        // View selection
        ////////////////////////////////////////////////////////////////////////

        const viewSelectorMenu = appendDivTo(this.div, { class: `vrv-menu` });
        this.viewSelector = appendDivTo(viewSelectorMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsLayout})` }, 'data-before': `View` });
        const viewSelectorSubmenuContent = appendDivTo(viewSelectorMenu, { class: `vrv-menu-content` });
        appendDivTo(viewSelectorSubmenuContent, { class: `vrv-v-separator` });

        let viewCount = 0;
        if (this.app.options.enableDocument) {
            this.viewDocument = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsDocument})` }, 'data-before': `Document` });
            this.viewDocument.dataset.view = 'document';
            this.app.eventManager.bind(this.viewDocument, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableResponsive) {
            this.viewResponsive = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsResponsive})` }, 'data-before': `Responsive` });
            this.viewResponsive.dataset.view = 'responsive';
            this.app.eventManager.bind(this.viewResponsive, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableEditor) {
            this.viewEditor = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsEditor})` }, 'data-before': `Editor` });
            this.viewEditor.dataset.view = 'editor';
            this.app.eventManager.bind(this.viewEditor, 'click', this.app.setView);
            viewCount += 1;
        }

        if (viewCount === 1) {
            viewSelectorMenu.style.display = 'none';
        }

        ////////////////////////////////////////////////////////////////////////
        // File
        ////////////////////////////////////////////////////////////////////////

        const fileMenu = appendDivTo(this.div, { class: `vrv-menu` });
        if (!app.options.enableEditor) fileMenu.style.display = 'none';
        this.fileMenuBtn = appendDivTo(fileMenu, { class: `vrv-btn-text`, 'data-before': `File` });
        const fileMenuContent = appendDivTo(fileMenu, { class: `vrv-menu-content` });
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        this.fileImport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.fileImport.dataset.ext = 'MEI';
        this.app.eventManager.bind(this.fileImport, 'click', this.app.fileImport);

        this.fileImportMusicXML = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MusicXML file` });
        fileMenuContent.appendChild(this.fileImportMusicXML);
        this.app.eventManager.bind(this.fileImportMusicXML, 'click', this.app.fileImport);

        const fileRecentSubMenu = appendDivTo(fileMenuContent, { class: `vrv-submenu` });
        this.fileRecent = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-text`, 'data-before': `Recent files` });

        this.subSubMenu = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-content` });
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        const fileExport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export MEI file` });
        fileExport.dataset.ext = 'MEI';
        this.app.eventManager.bind(fileExport, 'click', this.app.fileExport);

        const fileCopy = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Copy MEI to clipboard` });
        this.app.eventManager.bind(fileCopy, 'click', this.app.fileCopyToClipboard);

        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        const fileExportPDF = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as PDF` });
        this.app.eventManager.bind(fileExportPDF, 'click', this.app.fileExportPDF);

        const fileExportMIDI = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as MIDI` });
        this.app.eventManager.bind(fileExportMIDI, 'click', this.app.fileExportMIDI);

        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        this.fileSelection = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Apply content selection` });
        this.app.eventManager.bind(this.fileSelection, 'click', this.app.fileSelection);

        ////////////////////////////////////////////////////////////////////////
        // GitHub
        ////////////////////////////////////////////////////////////////////////

        this.githubMenu = appendDivTo(this.div, { class: `vrv-menu`, style: { display: `none` } });
        appendDivTo(this.githubMenu, { class: `vrv-btn-text`, 'data-before': `GitHub` });
        const githubMenuContent = appendDivTo(this.githubMenu, { class: `vrv-menu-content` });
        appendDivTo(githubMenuContent, { class: `vrv-v-separator` });

        this.githubImport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file from GitHub` });
        this.app.eventManager.bind(this.githubImport, 'click', this.app.githubImport);

        this.githubExport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Export (commit/push) to GitHub` });
        this.app.eventManager.bind(this.githubExport, 'click', this.app.githubExport);

        ////////////////////////////////////////////////////////////////////////
        // Navigation
        ////////////////////////////////////////////////////////////////////////

        this.pageControls = appendDivTo(this.div, { class: `vrv-btn-group` });
        appendDivTo(this.pageControls, { class: `vrv-h-separator` });

        this.prevPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsArrowLeft})` }, 'data-before': `Previous` });
        this.app.eventManager.bind(this.prevPage, 'click', this.app.prevPage);

        this.nextPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsArrowRight})` }, 'data-before': `Next` });
        this.app.eventManager.bind(this.nextPage, 'click', this.app.nextPage);

        ////////////////////////////////////////////////////////////////////////
        // Zoom
        ////////////////////////////////////////////////////////////////////////

        this.zoomControls = appendDivTo(this.div, { class: `vrv-btn-group` });
        appendDivTo(this.zoomControls, { class: `vrv-h-separator` });

        this.zoomOut = appendDivTo(this.zoomControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsZoomOut})` }, 'data-before': `Zoom out` });
        this.app.eventManager.bind(this.zoomOut, 'click', this.app.zoomOut);

        this.zoomIn = appendDivTo(this.zoomControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsZoomIn})` }, 'data-before': `Zoom in` });
        this.app.eventManager.bind(this.zoomIn, 'click', this.app.zoomIn);

        ////////////////////////////////////////////////////////////////////////
        // Sub-toolbars
        ////////////////////////////////////////////////////////////////////////

        this.midiPlayerSubToolbar = appendDivTo(this.div, {});
        this.editorSubToolbar = appendDivTo(this.div, {});

        ////////////////////////////////////////////////////////////////////////
        // Settings
        ////////////////////////////////////////////////////////////////////////

        appendDivTo(this.div, { class: `vrv-h-separator` });

        const settingsMenu = appendDivTo(this.div, { class: `vrv-menu` });
        if (!app.options.enableEditor) settingsMenu.style.display = 'none';
        appendDivTo(settingsMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsSettings})` }, 'data-before': `Settings` });
        const settingsMenuContent = appendDivTo(settingsMenu, { class: `vrv-menu-content` });
        appendDivTo(settingsMenuContent, { class: `vrv-v-separator` });

        this.settingsEditor = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Editor options` });
        this.app.eventManager.bind(this.settingsEditor, 'click', this.app.settingsEditor);

        this.settingsVerovio = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Verovio options` });
        this.app.eventManager.bind(this.settingsVerovio, 'click', this.app.settingsVerovio);

        ////////////////////////////////////////////////////////////////////////
        // Help
        ////////////////////////////////////////////////////////////////////////

        appendDivTo(this.div, { class: `vrv-h-separator` });

        const helpMenu = appendDivTo(this.div, { class: `vrv-menu` });
        if (!app.options.enableEditor) helpMenu.style.display = 'none';
        appendDivTo(helpMenu, { class: `vrv-btn-text`, 'data-before': `Help` });
        const helpMenuContent = appendDivTo(helpMenu, { class: `vrv-menu-content` });
        appendDivTo(helpMenuContent, { class: `vrv-v-separator` });

        this.helpAbout = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
        this.app.eventManager.bind(this.helpAbout, 'click', this.app.helpAbout);

        this.helpReset = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `Reset to default` });
        this.app.eventManager.bind(this.helpReset, 'click', this.app.helpReset);

        ////////////////////////////////////////////////////////////////////////
        // Login
        ////////////////////////////////////////////////////////////////////////

        this.loginGroup = appendDivTo(this.div, { class: `vrv-btn-group-right` });
        if (!app.options.enableEditor) this.loginGroup.style.display = 'none';
        appendDivTo(this.loginGroup, { class: `vrv-h-separator` });

        this.logout = appendDivTo(this.loginGroup, { class: `vrv-btn-text`, style: { display: `none` }, 'data-before': `Logout` });
        this.app.eventManager.bind(this.logout, 'click', this.app.logout);

        this.login = appendDivTo(this.loginGroup, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsGithubSignin})` }, 'data-before': `Github` });
        this.app.eventManager.bind(this.login, 'click', this.app.login);

        // Bindings for hiding menu once an item has be click - the corresponding class is
        // removed when the toolbar is moused over

        Array.from(this.div.querySelectorAll('div.vrv-menu')).forEach(node => {
            this.eventManager.bind(node, 'mouseover', this.onMouseOver);
        });

        Array.from(this.div.querySelectorAll('div.vrv-menu-text')).forEach(node => {
            this.eventManager.bind(node, 'click', this.onClick);
        });
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public getMidiPlayerSubToolbar(): HTMLDivElement { return this.midiPlayerSubToolbar;  }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public updateRecent(): void {
        this.subSubMenu.innerHTML = "";

        let fileList: Array<{ idx: number, filename: string }> = this.app.fileStack.fileList();
        for (let i = 0; i < fileList.length; i++) {
            const entry = appendDivTo(this.subSubMenu, { class: `vrv-menu-text`, 'data-before': fileList[i].filename });
            entry.dataset.idx = fileList[i].idx.toString();
            this.app.eventManager.bind(entry, 'click', this.app.fileLoadRecent);
            this.eventManager.bind(entry, 'click', this.onClick);
        }
    }

    private updateAll(): void {
        this.updateToolbarBtnEnabled(this.prevPage, (this.app.toolbarView.getCurrentPage() > 1));
        this.updateToolbarBtnEnabled(this.nextPage, (this.app.toolbarView.getCurrentPage() < this.app.pageCount));
        this.updateToolbarBtnEnabled(this.zoomOut, ((this.app.pageCount > 0) && (this.app.toolbarView.getCurrentZoomIndex() > 0)));
        this.updateToolbarBtnEnabled(this.zoomIn, ((this.app.pageCount > 0) && (this.app.toolbarView.getCurrentZoomIndex() < this.app.zoomLevels.length - 1)));

        let isResponsive = ((this.app.view instanceof ResponsiveView) && !(this.app.view instanceof EditorPanel));
        let isEditor = (this.app.view instanceof EditorPanel);
        let isDocument = (this.app.view instanceof DocumentView);

        const hasSelection = (this.app.options.selection && Object.keys(this.app.options.selection).length !== 0);

        this.updateToolbarGrp(this.pageControls, !isDocument);

        this.updateToolbarGrp(this.midiPlayerSubToolbar, isEditor || isResponsive);
        this.updateToolbarGrp(this.editorSubToolbar, isEditor);

        this.updateToolbarSubmenuBtn(this.viewDocument, isDocument);
        this.updateToolbarSubmenuBtn(this.viewResponsive, isResponsive);
        this.updateToolbarSubmenuBtn(this.viewEditor, isEditor);

        this.updateToolbarSubmenuBtn(this.fileSelection, hasSelection);

        if (this.app.githubManager.isLoggedIn()) {
            this.githubMenu.style.display = 'block';
            this.updateToolbarBtnDisplay(this.logout, true);
            this.login.setAttribute("data-before", this.app.githubManager.getName());
            this.login.classList.add("inactivated");
        }

        this.updateRecent();
    }

    ////////////////////////////////////////////////////////////////////////
    // Mouse methods
    ////////////////////////////////////////////////////////////////////////

    onMouseOver(e: CustomEvent): void {
        Array.from(this.div.querySelectorAll('div.vrv-menu-content')).forEach(node => {
            // Hide the menu content
            node.classList.remove("clicked");
        });
    }

    onClick(e: CustomEvent): void {
        Array.from(this.div.querySelectorAll('div.vrv-menu-content')).forEach(node => {
            // Remove the class so the menu content is shown again with a hover
            node.classList.add("clicked");
        });
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("AppToolbar::onActivate");

        this.updateAll();

        return true;
    }

    override onEndLoading(e: CustomEvent): boolean {
        if (!super.onEndLoading(e)) return false;
        //console.debug("AppToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    override onStartLoading(e: CustomEvent): boolean {
        if (!super.onStartLoading(e)) return false;
        //console.debug("AppToolbar:onStartLoading");

        this.updateToolbarBtnEnabled(this.prevPage, false);
        this.updateToolbarBtnEnabled(this.nextPage, false);
        this.updateToolbarBtnEnabled(this.zoomOut, false);
        this.updateToolbarBtnEnabled(this.zoomIn, false);

        return true;
    }
}
