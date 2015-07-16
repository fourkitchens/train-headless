# Getting Started
## Class handbook is available at:
[http://www.mirzu.com/headless-training-book/](http://www.mirzu.com/headless-training-book/)

## Class notes available at:
[Google Doc](http://4ktch.in/1O7aTHy)

## SSH to our server.

```bash
ssh {username}@headless.4kclass.com
```

Password is: `headlessNYC2015`

Your Drupal environment is available at: `http://{username}.drupal.headless.4kclass.com:8080/`

Here is what you should expect to see at your [URL](http://finished.drupal.headless.4kclass.com:8080/):

The administration user is `Four Kitchens` with password `admin`

For password-less authentication, add your public SSH key:

```bash
cat ~/.ssh/id_rsa.pub | ssh {username}@drupal.headless.4kclass.com "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

Alternativey, you can use a SFTP client.
- host: `USERNAME.drupal.headless.4kclass.com`
- password: `headlessNYC2015`
- port: `22`
