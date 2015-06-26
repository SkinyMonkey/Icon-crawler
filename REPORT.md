# Icon Crawler.

### Exercise

Icon crawler

The goal is to design an 'icon crawler', ie. a webservice (in the language of your choosing, even though we prefer in this order node.js, go, python, ruby) :
- to which you can send a request containing a domain name (eg. google.com)
- that needs to send back an image to be used as an icon for this website. The icon must have been fetched on the website. To know which icon should be fetched, a few stategies can be tried - trying to get domain.com/favicon.ico, www.domain.com/favicon.ico, domain.com/apple-touch-icon.png (icon used for iPhones, the quality is generally better than a favicon), look for a 'link' tag whose type is amongst ‘apple-touch-icon’, ‘shortcut icon’ ou ‘icon’ in the html source of the homepage...

The list of domains is not fixed in advance, there could be no icons for a domain (or the domain could not exist altogether).

Implementing a cache mechanism (with support for expiration) would be really appreciated - using in-memory or filesystems caches are fine.

Example of a request:
 
curl http://mysupericoncrawler/get?domain=dashlane.com
 
Example of a response:
Content-type: “image/png”, Content-length: 4646, ...
 
A simple version should be simple to do. Please use a revision control system (git/hg preferred) and commit regularly, so we can get a sense of how you work.
As nice-to-haves, the following topics could be implemented:
    - Improved cache (what strategies to use, what backend/storage/database...)
    - If 2 requests for the same domain are received in a short time interval, is there a way to deal with them in a smart way?
    - How to choose the best image? Is it better to try to parallelize the different strategies or do them sequentially?
    - Rate limiting (per domain, per ip?)
    - Possible architecture, if we were to scale to millions of users / requests per day...
 

We would be interested in your thoughts on these topics, without necessarily implementing them. What would you do, how your choices would depend on eg. the pattern of the calls (often the same few domains, or on the contrary many different domains), what technologies you would integrate... If you have remarks / thoughts on other topics that those mentionned, don't hesitate!

### Introduction

This icon crawler was realised using node.js and pure javascript.

I tried to work with this guide:
http://nodeguide.com/style.html

for naming conventions and keep a clear/clean code.

Git with git flow was used as a versioning tool.
(http://danielkummer.github.io/git-flow-cheatsheet/)

I like to use it to have a consistent model when working in team and ensure good practice at a personal level.

### Launch

As the project is using bunyan for console/file logging I recommand using the following line to launch it:

npm start | ./node_modules/bunyan/bin/bunyan

### General algorithm

When a request is received it will look if the icon is in cache.
If it's not it will check if the domain exists and, if everything is ok, finally try to download the icon
from the domain.

#### Strategies

For that it uses two strategies, launched sequentially, using the async module.

The later was used to clean up the code and could be used for future improvements.

The first strategy relies on the 'generic' places where a icon or favicon file can be found.

The second scrap the first webpage and looks for anything that looks for an icon based on the icon keyword and the link tag.

(no need for in depth search, showing the icon/logo as soon as possible seems a pretty obvious marketing topic)

I choosed to do them sequentially as the first strategy is nearly costless compared to the second one.

The system is made so that a new strategy could be added very easily.

#### Cache

A file system cache was handcrafted to allow quicker responses and lower ressource usage.

It uses a folder, where the found icon are stored and an index file, that contains a timestamp for expiration and some metadata about each icons.

On startup the index is loaded and will dumped in case of interruption (SIGINT signal).

The index file contains a simple JSON structure, easy to manipulate in javascript.

The cache module was made to be independant from the rest of the code.

By rewriting the functions, keeping the same prototypes input/outputs
we could easily replace this cache system by something else.

### A Bigger architecture

As for buildinga bigger architecture, here is what I think would work:

First, we should replace the cache with a real database engine.

Scaling horizontally using an fs cache doesn't seems like a good idea.

Mongodb would be good in that case, here is why:

- No relationships necessary in this project
- There will be few modifications of the data over time
- Queries are very simple, no need for a full SQL monster
- JSON oriented, to keep it simple and js compatible
- Sharding could be used easily, mongodb has native support for it
- Same thing for Redundancy/Replication

An in memory cache like Redis would work but json and persistance with great performances wins (mongo is mmapping files in memory, keeping it very efficient).

So the only plus of Redis I see here (in memory storage) is not enough to be a good fit

Couchbase could be a good option too, but as I don't have experience with it I will only refer to what is said about it that makes me think it could be a good tool:
It's said to be:

- Very fast
- To supports json
- Have persistence to disk
- Have master-master replication

It is also said overall that it's to consider for projects that needs:
- low latency data access
- high availability
- high concurrency support.

The second point I would look at is a message queue system to distribute tasks to workers and retrieve data from them.

It could also be used to keep track of which domain are being crawled at the moment, to avoid any multiple workers working on the same one.

About limiting the rate per domain or per ip, the database could be used.
A simple simple extra table could keep track of which ip is contacting the API and how much.

As a general architecture I would go for front workers that would receive the request
and check if the domain is in cache or not.
It would then send it back send some work to some background workers through the message queue system.
These front workers could also do some sharding work upon the cache/db in case it's not handled by the engine.

I know some people stores images in databases, I don't personally believes it's a good practice.
Db storage is more expensive than fs storage.

The sendfile call can be used to asynchronously send a file directly from the file system to the network interface.
(http://man7.org/linux/man-pages/man2/sendfile.2.html)

No need to encode/decode the picture.

And finally using an fs specialised in small files like XFS/ReiserFS could be a big plus.

To answer the question "How to choose the best image".

Well it all depends on what you want: the size, the weight, the quality ratio between the too.

But that could be added as an improvement in the parameters.

We can imagine adding a field of weight (instead of fixed values) for each characteristics and let the engine decide for us.

If I had to solve the "same few domains/many different domains"

For the second I would use what I described.

But for the first one I would handcraft a cache engine that use a specialized datastructure.

A tree that would rebalance to keep the most used domains information at the top.

Making it extremly fast.
(Sorry, despite looking for the name of such a tree for an hour, I could not find it back, If I do I'll send it to you right away)

#### Improvements

As Improvements I would add some points :
- Maybe do some preventive crawling of well known websites.
- Add a way to bypass the cache (with a limited rate of course) in the arguments.
- Add a bit of learning:
  if the result does not seems fine, add a way to tell the serv that the icon was not satisfying. If a certain score is reached, try other strategies to get it.
- A blacklist of images maybe?
- Add other ways to get an image,
  by checking for background images used on links and alike
  or even the fontabased icons like the one github uses.
