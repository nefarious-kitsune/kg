<h1>{{MAIN-HEADING}}</h1>
{{MAIN-CONTENT}}

<template id="urt-editor-template">
<div id="title-bar">
  <input id="message-title-input" placeholder="Message title" value="{{MESSAGE TITLE}}">
  <div class="right-button-group"
    ><button class="tool-button copy" onclick="" title="Copy to clipboard"></button
  ></div>
</div>
<div class="toolbar">
  <div class="button-group"
    ><button class="tool-button" id="open-file-button" title="Open file"></button
    ><button class="tool-button" id="save-file-button" onclick="saveFile('text-notice.txt')" title="Download file"></button
  ></div>
  <div class="button-group"
    ><button class="tool-button" id="undo-history-button" title="Undo change"></button
    ><button class="tool-button" id="redo-history-button" title="Redo change"></button
  ></div>
  <div class="button-group"
    ><div class="dropdown"
      ><button
        title="Set text size"
        class="dropdown-button tool-button text-size"
        onclick="showDropdownList('size-list')"></button
      ><div id="size-list" class="dropdown-content"></div
    ></div
  ></div>
  <div class="button-group"
    ><button class="tool-button" id="format-bold-button" title="Bold"></button
    ><button class="tool-button" id="format-italic-button" title="Italic"></button
    ><div class="dropdown" id="color-selector"
      ><button
        title="Set text color"
        class="dropdown-button tool-button text-color"
        onclick="showDropdownList('color-list')"></button
      ><div id="color-list" class="dropdown-content"></div
    ></div
  ></div>
  <div class="right-button-group"
    ><input type="file" id="open-file-selector" accept=".txt, .md"
    ><a id="download-link"></a
    ><button class="tool-button copy" onclick="copyInput()" title="Copy to clipboard"></button
  ></div>
</div>
<textarea
  id="message-body-input"
  placeholder="{{MESSAGE BODY PLACEHOLDER}}"
  maxlength="{{MAX CHAR COUNT}}"
  rows="5"
></textarea>
<div class="statusbar">
  <div class="text-group" id="status">
    <div id="normal-status"><span id="char-count"></span> / <span id="max-char-count"></span> chars</div>
    <div id="error-status"></div>
  </div>
  <div class="right-text-group" id="cursor-location">Ln 0, Col 0</div>
</div>
</template>

<div class="editor-container">
<section id="edit-pane">
<h2>Edit</h2>
<div id="urt-editor-host"></div>
</section>

<section id="preview-pane">
<h2>Preview</h2>
<div id="urt-preview"></div>
</section>
</div>

<section>
<h2>Note</h2>
<p>This tool is based on reverse engineering of the
<a href="./text-formatting">text formatting</a>
rules and may not replicate the output exactly. To ensure that
your in-game mail/message display properly, send it to an alt
account first.</p>
</section>

<div id="flash-notice" class="alert-success">Copied to clipboard</div>  

<script type="application/json" id="urtEditorOption">
{
  "maxLength" : {{MESSAGE MAX LENGTH}},
  "textSizeOptions"  : {{MESSAGE TEXT SIZE OPTIONS}},
  "textColorOptions" : {{MESSAGE TEXT COLOR OPTIONS}},
  "defaultTextSize"  : {{MESSAGE TEXT SIZE}},
  "defaultTextColor" : "{{MESSAGE TEXT COLOR}}",
  "defaultBackgroundColor": "{{MESSAGE BACKGROUND COLOR}}"
}
</script>
<script >
  const urtPreview = document.getElementById('urt-preview');
  const urtHost = document.getElementById('urt-editor-host');
  const urtEditor = new URTEditorElement();
  const urtOptions = JSON.parse(
    document.getElementById('URTOptions').textContent
  );

  urtEditor.initialize(URTOptions);
  urtEditor.linkPreview(urtPreview);

  urtHost.appendChild(urtEditor);

  urtEditor.render();
</script>

{{PAGINATION-BODY}}
