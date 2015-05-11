# Getting Started

## Class handbook is available at:

[http://www.mirzu.com/headless-training-book/](http://www.mirzu.com/headless-training-book/)

## Class notes available here:

[Google Doc](http://bit.ly/1E25cDN)

## SSH to our server.

```bash
ssh {username}@4kclass.com
```
password is ```headless2016la```

Your Drupal environment is available at: http://{username}.drupal.4kclass.com/

The administration user is ```admin``` with password ```admin```

Feel free to add your public ssh key
```bash
cat ~/.ssh/id_rsa.pub | ssh {username}@4kclass.com "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

Feel free to use an FTP client if you'd prefer.
*enable SFTP*
host: 4kclass
password: headless2016la
port: 22
