# Getting Started
## Class handbook is available at:
[http://www.mirzu.com/headless-training-book/](http://www.mirzu.com/headless-training-book/)

## Class notes available at:
[Google Doc](http://4ktch.in/1HfbsQQ)

## SSH to our server.

```bash
ssh {username}@tcdc2015.4kclass.com
```

Password is: `headless2016la`

Your Drupal environment is available at: [http://{username}.drupal.tcdc2015.4kclass.com:8080/](http://{username}.drupal.4kclass.com/)

The administration user is `admin` with password `admin`

For passwordless authentication, add your public SSH key:

```bash
cat ~/.ssh/id_rsa.pub | ssh {username}@tcdc2015.4kclass.com "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

Alternativey, you can use a SFTP client.
- host: `tcdc2015.4kclass.com`
- password: `headless2016la`
- port: `22`
