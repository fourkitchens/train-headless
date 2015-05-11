# Getting Started

## Class handbook is available at:

[http://www.mirzu.com/headless-training-book/](http://www.mirzu.com/headless-training-book/)

## Class notes available at:

[Google Doc](http://bit.ly/1E25cDN)

## SSH to our server.

```bash
ssh {username}@4kclass.com
```

Password is: ```headless2016la```

Your Drupal environment is available at: http://{username}.drupal.4kclass.com/

The administration user is ```admin``` with password ```admin```

For passwordless authentication, add your public SSH key:

```bash
cat ~/.ssh/id_rsa.pub | ssh {username}@4kclass.com "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

Alternativey, you can use a SFTP client.

* host: `4kclass.com`
* password: `headless2016la`
* port: `22`
