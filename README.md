# Getting Started
## Class handbook is available at:
[http://www.mirzu.com/headless-training-book/](http://www.mirzu.com/headless-training-book/)

## Class notes available at:


## SSH to our server.

```bash
ssh {username}@headless-{code}.4kclass.com
```

Your Drupal environment is available at: `http://{username}.drupal.headless{code}.4kclass.com/`

The administration user is `Four Kitchens` with password `admin`

For password-less authentication, add your public SSH key:

```bash
cat ~/.ssh/id_rsa.pub | ssh {username}@drupal.headless-{code}.4kclass.com "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

Alternativey, you can use a SFTP client.
- host: `USERNAME.drupal.headless-{code}.4kclass.com`
- port: `22`
