<h1>{{MAIN-HEADING}}</h1>
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
    ><button class="tool-button undo" onclick="undoAction()"></button
    ><button class="tool-button redo" onclick="redoAction()"></button
  ></div>
  <div class="button-group"
    ><div class="dropdown"
      ><button
        title="Set text size"
        class="dropdown-button tool-button text-size"
        onclick="showDropdownList('size-list')"></button
      ><div id="size-list" class="dropdown-content"><a
        ><span style="font-size: 12px">30px</span></a
        ><a href="#" onclick="setSize(35)"><span style="font-size: 14px">35px</span></a
        ><a href="#" onclick="setSize(40)"><span style="font-size: 16px">40px</span></a
        ><a href="#" onclick="setSize(50)"><span style="font-size: 20px">50px</span></a
      ></div
    ></div
  ></div>
  <div class="button-group"
    ><button class="tool-button bold" onclick="setBold()" title="Bold"></button
    ><button class="tool-button italic" onclick="setItalic()" title="Italic"></button
    ><div class="dropdown" id="color-selector-0"
      ><button
        title="Set text color"
        class="dropdown-button tool-button text-color"
        onclick="showDropdownList('color-list')"></button
      ><div id="color-list" class="dropdown-content"><a
          href="#" onclick="setColor('#B8F')"><span
          class="color-chip" style="background-color: #B8F;"></span></a
        ><a
          href="#" onclick="setColor('#D9F')"><span
          class="color-chip" style="background-color: #D9F;"></span></a
        ><a
          href="#" onclick="setColor('#F33')"><span
          class="color-chip" style="background-color: #F33;"></span></a
        ></div
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
    <div id="normal-status"><span id="char-count"></span> / {{MAX CHAR COUNT}} chars</div>
    <div id="error-status"></div>
  </div>
  <div class="right-text-group" id="cursor-location">Ln 0, Col 0</div>
</div>
<div id="flash-notice" class="alert-success">Copied to clipboard</div>
</template>
{{MAIN-CONTENT}}
{{PAGINATION-BODY}}
<div is="urt-editor"></div>
<script>
</script>
<div id="flash-notice" class="alert-success">Copied to clipboard</div>