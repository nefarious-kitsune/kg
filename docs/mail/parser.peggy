
// Bold text must be properly closed
//   Valid   :  <b>some text</b>
//   Invalid :     some text</b>
//   Invalid :  <b>some text

// Italic text must be properly closed
//   Valid   :  <i>some text</i>
//   Invalid :     some text</i>
//   Invalid :  <i>some text

// Space not allowed in <b> and <i> tags
//   Invalid : <b >some text</b>
//   Invalid : <i >some text</i>

// Some tag-like text are ignored and displayed as-is
//   Ignored: </ b>
//   Ignored: </ i>
//   Ingored: <abbr>some text</abbr>

// Space is allowed in color tag (but the result text is always white)
//   Valid  : <color=red >white text</color>

// Unknown color name is treated as white
//   Valid  : <color=charcoal>white text</color>

// Space is allowed in size tag
//   Valid   : <size=60 >Size 60</size>

ExportedContent
  = fragments:Fragment* {
    return fragments.join('');
  }

Char
  = !"<" .
  / &"<" !EndTag !StartTag "<"

Text
  = text:$(Char+) {
    return text
      .replaceAll('\n', '<br>\n')
      .replaceAll('\\n', '<br>\n');
  }

Fragment
  = head:Text? start:BoldStart   inner:Fragment* end:BoldEnd { return (head||'') + start + inner + end }
  / head:Text? start:ItalicStart inner:Fragment* end:ItalicEnd { return (head||'') + start + inner + end }
  / head:Text? start:SizeStart   inner:Fragment* end:SizeEnd { return (head||'') + start + inner + end }
  / head:Text? start:ColorStart  inner:Fragment* end:ColorEnd { return (head||'') + start + inner + end }
  / Text
  ;

WhiteSpace = [ \n\t]

StartTag
 = BoldStart
 / ItalicStart
 / ColorStart
 / SizeStart

BoldStart = "<b>"i { return '<span style="font-weight:bold">'};

ItalicStart = "<i>"i { return '<span style="font-style:italic">'};

ColorStart
  = "<color=" color:ColorCode ">" {
    return `<span style="color:${color}">`;
  };

SizeStart
  = "<size="i size:$([1-9][0-9]) " "? ">" {
    return `<span style="font-size:${(parseInt(size)/30).toFixed(1)}em">`;
  };

EndTag
 = BoldEnd / ItalicEnd / ColorEnd / SizeEnd;

BoldEnd = "</b>"i { return '</span>' };

ItalicEnd = "</i>"i { return '</span>' };

ColorEnd = "</color>"i { return '</span>' };

SizeEnd = "</size>"i { return '</span>' };

ColorCode
  = "black"i   { return 'black';  }
  / "silver"i  { return 'silver'; }
  / "gray"i    { return 'grey';   }
  / "white"i   { return 'white';  }
  / "maroon"i  { return 'maroon'; }
  / "red"i     { return 'red';    }
  / "purple"i  { return 'purple'; }
  / "fuchsia"i { return 'fuchsia';}
  / "green"i   { return 'green';  }
  / "lime"i    { return 'limek';  }
  / "olive"i   { return 'olive';  }
  / "yellow"i  { return 'yellow'; }
  / "navy"i    { return 'navy';   }
  / "blue"i    { return 'blue';   }
  / "teal"i    { return 'teal';   }
  / "aqua"i    { return 'aqua';   }
  / [ 0-9a-z]i* { return "white"  }
  ;
