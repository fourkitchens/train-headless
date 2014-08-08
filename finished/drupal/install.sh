#!/bin/sh
set -e

drush -y make --no-cache setup/site.make www
cd www
drush -y si --account-name=admin --account-pass=admin --db-url=mysql://fk:fkbuild@localhost/trainingdrupal
sed -i "" 's/\# RewriteBase \//RewriteBase \//' .htaccess
cp -R ../setup/modules/blog_migrate sites/all/modules/custom/
mkdir -p sites/default/files/migration/blog
cp ../setup/migration/blog/blog.xml sites/default/files/migration/blog
drush -y en blog_migrate
drush mar
drush mi BlogPost