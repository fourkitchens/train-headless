#!/bin/bash
set -e

WWW_PATH="/home/vagrant/workspace/drupal/www"

if [ -d "$WWW_PATH" ]; then
  sudo rm -rf $WWW_PATH
fi

/home/vagrant/.composer/vendor/bin/drush -y make --no-cache /home/vagrant/workspace/drupal/drupal-setup/setup/site.make /home/vagrant/workspace/drupal/www

cd $WWW_PATH
/home/vagrant/.composer/vendor/bin/drush -y si --account-name=admin --account-pass=admin --db-url=mysql://sqluser:sqluser@localhost/drupal

sed -i 's/\# RewriteBase \//RewriteBase \//' $WWW_PATH/.htaccess

mkdir -p $WWW_PATH/sites/all/modules/custom
mkdir -p $WWW_PATH/sites/all/modules/features
cp -R /home/vagrant/workspace/drupal/drupal-setup/setup/modules/fkblog $WWW_PATH/sites/all/modules/custom/fkblog
cp -R /home/vagrant/workspace/drupal/drupal-setup/setup/modules/fkblog_features $WWW_PATH/sites/all/modules/features/fkblog
cp -R /home/vagrant/workspace/drupal/drupal-setup/setup/modules/services_hal $WWW_PATH/sites/all/modules/custom/services_hal
mkdir -p $WWW_PATH/sites/default/files/migration/blog
cp /home/vagrant/workspace/drupal/drupal-setup/setup/migration/blog/blog.xml $WWW_PATH/sites/default/files/migration/blog

/home/vagrant/.composer/vendor/bin/drush -y en fkblog
/home/vagrant/.composer/vendor/bin/drush mar
/home/vagrant/.composer/vendor/bin/drush mi BlogPost
#/home/vagrant/.composer/vendor/bin/drush cc drush
#/home/vagrant/.composer/vendor/bin/drush -y composer-manager install
