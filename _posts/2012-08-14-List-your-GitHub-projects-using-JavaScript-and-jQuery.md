---
layout: post
title: List your GitHub projects using JavaScript and jQuery
tags: javascript, jquery, github, repo, script, json
description: Generate and insert in a HTML page a list of github's projects.
keywords: javascript, jquery, github, repo, script, json
---

## Do you know GitHub ? ##

----------
<br/>
<center><img src="http://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/GitHub.svg/140px-GitHub.svg.png"></center>


Well, let's just quote [Wikipedia](http://en.wikipedia.org/wiki/GitHub "GitHub on Wikipedia").

> *GitHub is a web-based hosting service for software development projects that use the Git revision control system. GitHub offers both paid plans for private repositories, and free accounts for open source projects.*

I have been using GitHub since 2011, to host and share my on-going projects sources.  For open-source softwares, gitHub is just perfect.

<br/>
# GitHub, as a web-host #

----------

Nope, you did not misread. GitHub provides web-hosting services, for free. Using [GitHub's Pages](http://pages.github.com/ "Github's Pages"), one can freely create its own blog, website. And this works fine. Actually, this devblog is hosted at [GitHub](https://github.com/Yonaba/yonaba.github.com), and was generated using Jekyll, a static website generator.
If you are interested, have a look at these links:

- [GitHub's Pages](http://pages.github.com/ "Github's Pages")
- [Jekyll](https://github.com/mojombo/jekyll "Jekyll")
- [Generate a site with Jekyll](http://klepas.org/jekyll-a-static-site-generator/)

<br/>
<br/>
# List GitHub's repositories using javaScript and jQuery #

----------

I will assume that you already have a fully working website, and you want to include in some pages a list of repositories from a gitHubber (omeone who uses GitHub).
before we go further, let me say that you may find over the internet some snippets for the same purpose.

- [List of GitHub's projects using JavaScript](http://aboutcode.net/2010/11/11/list-github-projects-using-javascript.html)
- [Gist (Snippet) for  the list of GitHub's projects using Javascript](https://gist.github.com/673256)
- [Snagging Github's repos with YQL](https://gist.github.com/674668)

Truth is, I tried most of them, and they didn't work at all. Well, they may have worked once, in the past, but since GitHub's API have changed, these snippets are now outdated.
The [latest version of GitHub's API is now v3](http://developer.github.com/v3/), actually (I mean, at the time I am writing this).<br/>
If you want to see a fully working version of this script, see my [Projects page](http://yonaba.github.com/projects.html). <br/>
To have the same on your website, please go further reading.

<br/>
# Now, get the code#

----------

You certainly have an HTML file where you want to include automatically the list of your GitHub's projects. Inside this HMTL file, insert a <tt>div</tt> container with a custom ID. Here, I will use *my-github-projects* as an ID for this container.

    
<pre class="language-html">   ...
   &lt;div id="my-github-projects"&gt;&lt;/div&gt;
   ...    
</pre>  
	
Next, inside the same file, where you close the body of the page, add the following script:

<pre class="language-javascript">...
&lt;script src="http://ajax.microsoft.com/ajax/jquery/jquery-1.4.2.min.js" 
   type="text/javascript"&gt;&lt;/script&gt;
&lt;script src="/scripts/github-query-lib.js" type="text/javascript"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
   $(function() {
      $("#my-github-projects").loadRepositories(YOUR_GITHUB_USERNAME);
   });
&lt;/script&gt;
&lt;/body&gt;
</pre>
    
Make sure you replace *YOUR_GITHUB_USERNAME* with your **real github username** or whoever's, between quotes. For instance, mine is [Yonaba](https://github.com/Yonaba), then I have the following:

<pre class="language-javascript">...
&lt;script src="http://ajax.microsoft.com/ajax/jquery/jquery-1.4.2.min.js" 
   type="text/javascript"&gt;&lt;/script&gt;
&lt;script src="/scripts/github-query-lib.js" type="text/javascript"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
   $(function() {
      $("#my-github-projects").loadRepositories("Yonaba");
   });
&lt;/script&gt;
&lt;/body&gt;
</pre>

Now, let's dive into JavaScript. You may have noticed that the previous code calls a Javascript file, named "*github-query.js*", in a relative folder named "*scripts*". That's just an assumption. If your scripts are usually located in another place, fix the path before proceeding further.<br/>
Now, create a file named *github-query.js*, then open it, and paste the following code inside:

<pre class="language-javascript">jQuery.githubUser = function(username, callback) {
   jQuery.getJSON('https://api.github.com/users/'+
      username+
      '/repos?callback=?',callback)
}

jQuery.fn.loadRepositories = function(username) {
   this.html("&lt;span&gt;Querying GitHub for " + 
      username +
      "'s repositories...&lt;/span&gt;");

   var target = this;
   $.githubUser(username, function(data) {
   var repos = data.data; // JSON Parsing
   sortByName(repos);

   var list = $('&lt;dl/&gt;');
   target.empty().append(list);
   $(repos).each(function() {
      if (this.name != (username.toLowerCase()+'.github.com')) {
         list.append('&lt;dt&gt;&lt;a href="'+ 
            (this.homepage?this.homepage:this.html_url) +'"&gt;'+
            this.name + '&lt;/a&gt; &lt;em&gt;'+(this.language?('('+
            this.language+')'):'')+'&lt;/em&gt;&lt;/dt&gt;');
         list.append('&lt;dd&gt;' + this.description +'&lt;/dd&gt;');
      }
   });      
});

function sortByName(repos) {
   repos.sort(function(a,b) {
   return a.name - b.name;
 });
}
</pre>

Some explanations ? 
Well, that's fairly simple and straighforward.<br/>
*githubUser* function just addresses a query to GitHub's API, and returns the requested data into [JSON](en.wikipedia.org/wiki/JSON  "JSON") format.

The response will look like a regular table:

<pre class="language-json">jsonp1344885824998({
   "data": [
      {
         "forks": 2,
         "language": "Lua",
         "created_at": "2012-07-24T09:12:35Z",
         "description": "A utility library to manipulate strings in Lua",
         "ssh_url": "git@github.com:Yonaba/Allen.git",
         "owner": {
            "login": "Yonaba",
            "avatar_url": "https://secure.gravatar.com/avatar/..."
            "url": "https://api.github.com/users/Yonaba",
            "gravatar_id": "50617b23d4317f7edf65af426d146b65",
            "id": 884058
                },
         "has_downloads": true,
         "mirror_url": null,
         "updated_at": "2012-08-11T07:19:33Z",
         "forks_count": 2,
         "svn_url": "https://github.com/Yonaba/Allen",
         "has_wiki": true,
         "git_url": "git://github.com/Yonaba/Allen.git",
         "html_url": "https://github.com/Yonaba/Allen",
         "watchers": 4,
         "size": 160,
         "fork": false,
         "full_name": "Yonaba/Allen",
         "watchers_count": 4,
         "clone_url": "https://github.com/Yonaba/Allen.git",
         "name": "Allen",
         "url": "https://api.github.com/repos/Yonaba/Allen",
         "open_issues": 0,
         "has_issues": true,
         "homepage": "http://yonaba.github.com/Allen",
         "private": false,
         "id": 5163451,
         "open_issues_count": 0,
         "pushed_at": "2012-08-05T08:14:21Z"
      },
      {...}, 
      {...}, 
      ...
    ],
   "meta": {
   "status": 200,
   "X-RateLimit-Limit": "5000",
   "X-RateLimit-Remaining": "4999"
 }
})
</pre>

You can notice that data contents can be extracted via indexing the *data* field of the main table. Then we can loop trough its contents to catch the details we need.<br/><br/>
Actually, this is what the function *loadRepositories* does. It accesses the data field, retrieves the list of repositories, sorts them by name then loop through to retrieve their *homepages*/*html_url*, *name*, *language* and *description*. <br/>

It works like a charm.<br/>

The if-check is optional here, I used this trick to skip the repository hosting my website, as I do not want it to appear in the list.

If you need more details, you can have a look here : [GitHub Developer Api v3 - Repos](http://developer.github.com/v3/repos/)

I hope that might help. Feel free to use it, without any credits.<br/>
If you come up with a better version, with nice tweaks or improvements, let me know via comments, or [contact](http://yonaba.github.com/contact.html) me!
Happy coding!