var Markdown = {
    init: function(ev) {
        // initialization code
        if(this.initialized) {
            dump('Already initialized!\n');
            return;
        }
        dump('Markdown initializing\n');

        this.composer = window.gMsgCompose;
        this.editor   = this.composer.editor;
        this.splitter = document.getElementById('markdownPreviewSplitter');
        this.iframe   = document.getElementById('markdownPreview');
        this.converter  = new Showdown.converter();

        dump('Contents: ' + this.editor.contentsMIMEType + '\n');

        if(this.composer.composeHTML) {
            dump('Nothing to do for HTML mail\n');
            var toggler = document.getElementById('toggleMarkdown');
            toggler.hidden = true;
            return;
        }

        this.initialized = true;
        this.strings = document.getElementById("markdown-strings");
    },

    renderHtml: function() {
        dump('Rendering\n');

        // Can't use 'this' since the context is the HTML element.
        var text = Markdown.editor.outputToString('text/plain', Markdown.editor.eNone);
        var html = Markdown.converter.makeHtml(text);
        try {
            var doc = Markdown.iframe.contentDocument;
        }
        catch(TypeError) {
            dump('No document found\n');
            return;
        }

        var body = doc.getElementById('markdownPreviewBody');
        body.innerHTML = html;
    },


    doPreview: function(checkbox) {
        var enabled = checkbox.getAttribute('checked');
        var body    = document.getElementById('content-frame').contentDocument.body;
        var events  = ['DOMNodeInserted', 'DOMNodeRemoved', 'DOMCharacterDataModified'];

        if(enabled) {
            dump('Should preview\n');

            // Hook into the mail body and update the HTML version as it changes.
            for(var a in events) {
                body.addEventListener(events[a], this.renderHtml, false);
            }

            // Display the HTML before rendering.
            this.splitter.style.display = null;
            this.iframe.style.display = null;

            // For some reason, rendering directly doesn't work, so delay it a bit.
            var th = this;
            window.setTimeout(function() { th.renderHtml(); }, 100);
        }
        else {
            dump('Should NOT preview\n');
            this.splitter.style.display = 'none';
            this.iframe.style.display = 'none';

            // Detach the signal handlers.
            for(var a in events) {
                body.removeEventListener(events[a], this.renderHtml, false);
            }
        }

        return true; // Allow setting the checkbox to happen.
    },

    /*
    onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
    this.strings.getString("helloMessage"));
    },
    */

    onLoad: function() {
        // According to the bordercolors extension, onload doesn't work so do what they do.
        var composer = document.getElementById('msgcomposeWindow');
        composer.addEventListener('focus', function(e) { Markdown.init(e); }, false);
    },
};

Markdown.onLoad();
