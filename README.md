Cloud Foundry Snake Game Demo
===

HDYA, 2017-04-01

Overview
---

This project is a simple demo for cloud foundry to demo the process of its updates and modification for apps.

1.Deploy cloud foundry
---

Please follow the steps listed [here](https://github.com/cloudfoundry-incubator/bosh-azure-cpi-release/blob/master/docs/guidance.md) to deploy and setup cloud foundry on Azure.

2.Login into cloud foundry
---

Execute the following commands in your devbox

    cf login -a https://api.REPLACE_WITH_CLOUD_FOUNDRY_PUBLIC_IP.xip.io --skip-ssl-validation -u admin -p c1oudc0w
    cf create-space azure
    cf target -o "REPLACE_WITH_CLOUD_FOUNDRY_PUBLIC_IP.xip.io_ORGANIZATION" -s "azure"

3.Clone this demo into devbox
---

Execute the following comands in your devbox to clone this demo into your devbox

    sudo apt-get -y install git
    git clone https://github.com/HDYA/cloud-foundry-snake-demo.git
    cd cloud-foundry-snake-demo
    git submodule update --init --recursive

_This demo reference project rattler-race as submodule, do execute the last command to clone the submodule too_

4.Configure and push demo onto cloud foundry
---

Modify configuration file at `hub/config.js`, replace `REPLACE_WITH_CLOUD_FOUNDRY_PUBLIC_IP` with you public IP for cloud foundry.

Execute the following commands to push apps onto cloud foundry.

    cd instances
    cf push

    cd ../hub
    cf push

Then when you open `http://demo-hub.REPLACE_WITH_CLOUD_FOUNDRY_PUBLIC_IP.xip.io/demo` with your browser, you should see the interface of the demo.

5.Demo of instance update
---

Click `Remote Demo` on the webpage to enter the demo, you should see moving snakes each represents one instance of instance app.

On your devbox, modify file of instance `instance/index.js` with command

    vim instance/config.js

Comment the sentence `move = true;` and uncomment the sentence `move = false;`.

Save `config.js` and push instance app onto cloud foundry with command `cf push`, you should see moving snakes gradually stop moving as new version of instance app being deployed.

6.Demo of instance scale
---

Execute the following command onto your devbox to change instance count into 20

    cf scale snake-demo-instance -i 20

Meanwhile, in the demo page you should see 10 more snakes came into alive.