#!groovy

// Run this node on a NodeJS Slave
node('nodejs') {
  //env.NODEJS_HOME = "${tool} ''"

  stage('Build OpenShift Image') {
    // Start Build in OpenShift using the file we just published
    sh "oc project ssptool"
    sh "oc start-build ssptool -n ssptool"

    openshiftTag alias: 'false', destStream: 'ssptool', destTag: 'master', destinationNamespace: 'ssptool', namespace: 'ssptool', srcStream: 'ssptool', srcTag: 'latest', verbose: 'false'
  }

  stage('Deploy New Image') {
    // Patch the DeploymentConfig so that it points to the latest Image.
    sh "oc project ssptool"
    sh "oc patch dc ssptool --patch '{\"spec\": { \"triggers\": [ { \"type\": \"ImageChange\", \"imageChangeParams\": { \"containerNames\": [ \"ssptool\" ], \"from\": { \"kind\": \"ImageStreamTag\", \"namespace\": \"ssptool\", \"name\": \"ssptool:master\"}}}]}}' -n ssptool"

    openshiftDeploy depCfg: 'ssptool', namespace: 'ssptool', verbose: 'false', waitTime: '', waitUnit: 'sec'
    openshiftVerifyDeployment depCfg: 'ssptool', namespace: 'ssptool', replicaCount: '1', verbose: 'false', verifyReplicaCount: 'false', waitTime: '', waitUnit: 'sec'
    openshiftVerifyService namespace: 'ssptool', svcName: 'ssptool', verbose: 'false'
  }

}
