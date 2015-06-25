; This file was auto-generated by drush make
core = 7.x

api = 2
projects[drupal][version] = "7.38"

; Modules
projects[admin_menu][subdir] = "contrib"
projects[admin_menu][version] = "3.0-rc5"

projects[ctools][subdir] = "contrib"
projects[ctools][version] = "1.7"

projects[devel][subdir] = "contrib"
projects[devel][version] = "1.5"

projects[entity][subdir] = "contrib"
projects[entity][version] = "1.6"
projects[entity][patches][] = "https://www.drupal.org/files/issues/2086225-entity-access-check-18.patch"

projects[entityreference][subdir] = "contrib"
projects[entityreference][version] = "1.1"

projects[libraries][subdir] = "contrib"
projects[libraries][version] = "2.2"

projects[markdown][subdir] = "contrib"
projects[markdown][version] = "1.2"

projects[restful][subdir] = "contrib"
projects[restful][version] = "1.0"

projects[views][subdir] = "contrib"
projects[views][version] = "3.11"

projects[restful_fourword][type] = "module"
projects[restful_fourword][download][type] = "git"
projects[restful_fourword][download][url] = "git@github.com:fourkitchens/restful_fourword.git"
projects[restful_fourword][download][branch] = "lesson3-3"
projects[restful_fourword][download][revision] = "23557eb77fceb1b5c8e9f076ef4f27383086f1ea"
