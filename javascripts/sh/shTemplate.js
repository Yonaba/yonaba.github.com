<!-- Include required JS files -->
<script type="text/javascript" src="javascripts/sh/shCore.js"></script>
 
<!--
    At least one brush, here we choose JS. You need to include a brush for every
    language you want to highlight
-->
<script type="text/javascript" src="javascripts/sh/shBrushLua.js"></script>
 
<!-- Include *at least* the core style and default theme -->
<link href="css/sh/shCore.css" rel="stylesheet" type="text/css" />
<link href="css/sh/shThemeDefault.css" rel="stylesheet" type="text/css" />
 
<!-- You also need to add some content to highlight, but that is covered elsewhere. -->
<pre class="brush: lua">
function foo(arg,...)
	return arg
end
</pre>
 
<!-- Finally, to actually run the highlighter, you need to include this JS on your page -->
<script type="text/javascript">
     SyntaxHighlighter.all()
</script>