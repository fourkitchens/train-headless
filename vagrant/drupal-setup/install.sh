#!/bin/bash
set -e

/home/vagrant/.composer/vendor/bin/drush -y make --no-cache /home/vagrant/finished/drupal/drupal-setup/setup/site.make www

cd /home/vagrant/finished/drupal/www/
/home/vagrant/.composer/vendor/bin/drush -y si --account-name=admin --account-pass=admin --db-url=mysql://sqluser:sqluser@localhost/drupal_finished

sed -i 's/\# RewriteBase \//RewriteBase \//' /home/vagrant/finished/drupal/www/.htaccess

cp -R /home/vagrant/finished/drupal/drupal-setup/setup/modules/fkblog /home/vagrant/finished/drupal/www/sites/all/modules/custom/
mkdir -p /home/vagrant/finished/drupal/www/sites/default/files/migration/blog
cp /home/vagrant/finished/drupal/drupal-setup/setup/migration/blog/blog.xml /home/vagrant/finished/drupal/www/sites/default/files/migration/blog

/home/vagrant/.composer/vendor/bin/drush -y en fkblog
/home/vagrant/.composer/vendor/bin/drush mar
/home/vagrant/.composer/vendor/bin/drush mi BlogPost
