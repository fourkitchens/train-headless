#!/bin/bash
set -e

WWW_PATH="/home/vagrant/finished/drupal/www"

if [ -d "$WWW_PATH" ]; then
  sudo rm -rf $WWW_PATH
fi

/home/vagrant/.composer/vendor/bin/drush -y make --no-cache /home/vagrant/finished/drupal/drupal-setup/setup/site.make www

cd $WWW_PATH
/home/vagrant/.composer/vendor/bin/drush -y si --account-name=admin --account-pass=admin --db-url=mysql://sqluser:sqluser@localhost/drupal_finished

sed -i 's/\# RewriteBase \//RewriteBase \//' $WWW_PATH/.htaccess

cp -R /home/vagrant/finished/drupal/drupal-setup/setup/modules/fkblog $WWW_PATH/sites/all/modules/custom/
mkdir -p $WWW_PATH/sites/default/files/migration/blog
cp /home/vagrant/finished/drupal/drupal-setup/setup/migration/blog/blog.xml $WWW_PATH/sites/default/files/migration/blog

/home/vagrant/.composer/vendor/bin/drush -y en fkblog
/home/vagrant/.composer/vendor/bin/drush mar
/home/vagrant/.composer/vendor/bin/drush mi BlogPost
