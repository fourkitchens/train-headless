core = 7.x
api = 2

projects[drupal][version] = 7.37

; Modules
projects[ctools][subdir] = "contrib"
projects[ctools][version] = "1.4"

projects[admin_menu][subdir] = "contrib"

projects[entity][subdir] = "contrib"
projects[entity][version] = "1.6"
projects[entity][patch][] = "https://www.drupal.org/files/issues/2086225-entity-access-check-18.patch"

projects[restful][subdir] = "contrib"
projects[restful][version] = "1.0"

projects[features][subdir] = "contrib"
projects[features][version] = "2.5"

projects[media][subdir] = "contrib"
projects[media][version] = "1.5"

projects[markdown][subdir] = "contrib"
projects[markdown][version] = "1.2"

projects[migrate][subdir] = "contrib"
projects[migrate][version] = "2.7"
