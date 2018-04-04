#!groovy

// Run this node on a NodeJS Slave
node('node') {
  stage('Checkout Source') {
    // Get Source Code from SCM (Git) as configured in the Jenkins Project
    git 'https://github.com/SecurityCentral/ssptool'
  }

  stage('Build SSPTOOL') {
    echo "Building SSPTOOL..."
    
    sh 'node -v'
    sh 'npm prune'
    sh 'npm install'
  }

  stage('Build OpenShift Image') {
    def newTag = "TestingCandidate-${version}"
    echo "New Tag: ${newTag}"

    // Start Binary Build in OpenShift using the file we just published
    // Replace rga-tasks-dev with the name of your dev project
    sh "oc project rga-tasks-dev"
    sh "oc start-build tasks --follow --from-file=./ROOT.war -n rga-tasks-dev"

    openshiftTag alias: 'false', destStream: 'tasks', destTag: newTag, destinationNamespace: 'rga-tasks-dev', namespace: 'rga-tasks-dev', srcStream: 'tasks', srcTag: 'latest', verbose: 'false'
  }

  stage('Deploy New Image') {
    // Patch the DeploymentConfig so that it points to the latest TestingCandidate-${version} Image.
    // Replace rga-tasks-dev with the name of your dev project
    sh "oc project ssptool"
    sh "oc patch dc tasks --patch '{\"spec\": { \"triggers\": [ { \"type\": \"ImageChange\", \"imageChangeParams\": { \"containerNames\": [ \"tasks\" ], \"from\": { \"kind\": \"ImageStreamTag\", \"namespace\": \"ssptool\", \"name\": \"tasks:TestingCandidate-$version\"}}}]}}' -n ssptool"

    openshiftDeploy depCfg: 'tasks', namespace: 'ssptool', verbose: 'false', waitTime: '', waitUnit: 'sec'
    openshiftVerifyDeployment depCfg: 'tasks', namespace: 'ssptool', replicaCount: '1', verbose: 'false', verifyReplicaCount: 'false', waitTime: '', waitUnit: 'sec'
    openshiftVerifyService namespace: 'ssptool', svcName: 'ssptool', verbose: 'false'
  }

}
